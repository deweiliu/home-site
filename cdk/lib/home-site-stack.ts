import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as alias from '@aws-cdk/aws-route53-targets';
import { VpcStack as SubnetStack } from './vpc-stack';
import { EcsStack } from './ecs-stack';

export interface CdkStackProps extends cdk.StackProps {
  maxAzs: number;
  appId: number;
}
export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: cdk.Fn.importValue('DLIUCOMHostedZoneID').toString(),
      zoneName: 'dliu.com',
    });

    const igwId = cdk.Fn.importValue('Core-InternetGateway');
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ALBVPC', {
      vpcId: cdk.Fn.importValue('Core-Vpc'),
      availabilityZones: cdk.Fn.split(',', cdk.Fn.importValue('Core-VpcAvailabilityZones').toString()),
      vpcCidrBlock: cdk.Fn.importValue('Core-VpcCidr'),
      publicSubnetIds: cdk.Fn.split(',', cdk.Fn.importValue('Core-AlbPublicSubnets').toString()),
      publicSubnetRouteTableIds: cdk.Fn.split(',', cdk.Fn.importValue('Core-AlbPublicSubnetRouteTables').toString()),
    });

    // const albVpc = ec2.Vpc.fromVpcAttributes(this, 'ALBVPC', {
    //   vpcId: cdk.Fn.importValue('Core-AlbVpc'),
    //   availabilityZones: ['eu-west-1'],
    //   vpcCidrBlock: cdk.Fn.importValue('Core-AlbVpcCidr'),
    //   publicSubnetIds: [],
    //   publicSubnetRouteTableIds: [],
    // });

    const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, "ALBSecurityGroup",
      cdk.Fn.importValue('Core-AlbSecurityGroup')
    );
    const albListener = elb.ApplicationListener.fromApplicationListenerAttributes(this, "ELBListener", {
      listenerArn: cdk.Fn.importValue('Core-AlbListener'),
      securityGroup: albSecurityGroup,
    });

    const alb = elb.ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(this, 'ALB', {
      loadBalancerArn: cdk.Fn.importValue('Core-Alb').toString(),
      securityGroupId: cdk.Fn.importValue('Core-AlbSecurityGroup').toString(),
      loadBalancerCanonicalHostedZoneId: cdk.Fn.importValue('Core-AlbCanonicalHostedZone').toString(),
      loadBalancerDnsName: cdk.Fn.importValue('Core-AlbDns').toString(),
    });

    const vpcStack = new SubnetStack(this, 'SubnetStack', { vpc: vpc, maxAzs: props.maxAzs, appId: props.appId, igwId });


    const ecs = new EcsStack(this, 'ECS', {
      subnets: vpcStack.subnets,
      albSecurityGroup,
      albListener,
      vpc: vpc,
      appId: props.appId,
    });

    const record = new route53.ARecord(this, "AliasRecord",
      {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(new alias.LoadBalancerTarget(alb)),
      });

    new cdk.CfnOutput(this, 'AlbDnsName', { value: record.domainName });

  }
}
