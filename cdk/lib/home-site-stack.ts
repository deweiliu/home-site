import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as alias from '@aws-cdk/aws-route53-targets';
import { SubnetsStack } from './subnets-stack';
import { EcsStack } from './ecs-stack';
import { Tags } from '@aws-cdk/core';

export interface CdkStackProps extends cdk.StackProps {
  maxAzs: number;
  appId: number;
  dns: string;
}
export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);
    Tags.of(this).add('service','home-site');

    const { hostedZone, igwId, vpc, alb, albSecurityGroup, albListener } = this.importValues(props);

    const vpcStack = new SubnetsStack(this, 'SubnetsStack', { vpc: vpc, maxAzs: props.maxAzs, appId: props.appId, igwId });

    const ecs = new EcsStack(this, 'ECS', {
      subnets: vpcStack.subnets,
      albSecurityGroup,
      albListener,
      vpc: vpc,
      appId: props.appId,
      dns: props.dns,
    });

    const record = new route53.ARecord(this, "AliasRecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new alias.LoadBalancerTarget(alb)),
    });

    new cdk.CfnOutput(this, 'DnsName', { value: record.domainName });
  }

  importValues(props: CdkStackProps) {
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: cdk.Fn.importValue('DLIUCOMHostedZoneID'),
      zoneName: props.dns,
    });

    const igwId = cdk.Fn.importValue('Core-InternetGateway');

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ALBVPC', {
      vpcId: cdk.Fn.importValue('Core-Vpc'),
      availabilityZones: cdk.Stack.of(this).availabilityZones,
    });

    const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, "ALBSecurityGroup",
      cdk.Fn.importValue('Core-AlbSecurityGroup')
    );
    const albListener = elb.ApplicationListener.fromApplicationListenerAttributes(this, "ELBListener", {
      listenerArn: cdk.Fn.importValue('Core-AlbListener'),
      securityGroup: albSecurityGroup,
    });

    const alb = elb.ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(this, 'ALB', {
      loadBalancerArn: cdk.Fn.importValue('Core-Alb'),
      securityGroupId: albSecurityGroup.securityGroupId,
      loadBalancerCanonicalHostedZoneId: cdk.Fn.importValue('Core-AlbCanonicalHostedZone'),
      loadBalancerDnsName: cdk.Fn.importValue('Core-AlbDns'),
    });

    return { hostedZone, igwId, vpc, alb, albSecurityGroup, albListener };
  }
}
