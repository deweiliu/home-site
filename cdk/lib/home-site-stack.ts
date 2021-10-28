import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as alias from '@aws-cdk/aws-route53-targets';
import { VpcStack } from './vpc-stack';
import { EcsStack } from './ecs-stack';

export interface CdkStackProps extends cdk.StackProps {
  maxAzs: number;
}
export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: cdk.Fn.importValue('DLIUCOMHostedZoneID').toString(),
      zoneName: 'dliu.com',
    });

    const publicSubnetRouteTableIds = cdk.Fn.split(',', cdk.Fn.importValue('CoreAlbVpcPublicSubnetRouteTables').toString());
    const albVpc = ec2.Vpc.fromVpcAttributes(this, 'ALBVPC', {
      vpcId: cdk.Fn.importValue('CoreAlbVpc'),
      availabilityZones: cdk.Fn.split(',', cdk.Fn.importValue('CoreAlbVPCAvailabilityZones').toString()),
      vpcCidrBlock: cdk.Fn.importValue('CoreAlbVpcCidr'),
      publicSubnetIds: cdk.Fn.split(',', cdk.Fn.importValue('CoreAlbVpcPublicSubnets').toString()),
      publicSubnetRouteTableIds: cdk.Fn.split(',', cdk.Fn.importValue('CoreAlbVpcPublicSubnetRouteTables').toString()),
    });

    // const albVpc = ec2.Vpc.fromVpcAttributes(this, 'ALBVPC', {
    //   vpcId: cdk.Fn.importValue('CoreAlbVpc'),
    //   availabilityZones: ['eu-west-1'],
    //   vpcCidrBlock: cdk.Fn.importValue('CoreAlbVpcCidr'),
    //   publicSubnetIds: [],
    //   publicSubnetRouteTableIds: [],
    // });

    const albSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, "ALBSecurityGroup",
      cdk.Fn.importValue('CoreAlbSecurityGroup')
    );
    const albListener = elb.ApplicationListener.fromApplicationListenerAttributes(this, "ELBListener", {
      listenerArn: cdk.Fn.importValue('CoreAlbListener'),
      securityGroup: albSecurityGroup,
    });

    const alb = elb.ApplicationLoadBalancer.fromApplicationLoadBalancerAttributes(this, 'ALB', {
      loadBalancerArn: cdk.Fn.importValue('CoreAlb').toString(),
      securityGroupId: cdk.Fn.importValue('CoreAlbSecurityGroup').toString(),
      loadBalancerCanonicalHostedZoneId: cdk.Fn.importValue('CoreAlbCanonicalHostedZone').toString(),
      loadBalancerDnsName: cdk.Fn.importValue('CoreAlbDns').toString(),
    });



    const vpcStack = new VpcStack(this, 'VPC', { albVpc, maxAzs: props.maxAzs, publicSubnetRouteTableIds });

    // const elbStack = new LoadBalancingStack(this, 'LoadBalancing',
    //   { vpc: vpcStack.vpc, hostedZone, }
    // );

    const ecs = new EcsStack(this, 'ECS', {
      vpc: vpcStack.vpc,
      albSecurityGroup,
      albListener,
      albVpc,
    });

    const record = new route53.ARecord(this, "AliasRecord",
      {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(new alias.LoadBalancerTarget(alb)),
      });


    new cdk.CfnOutput(this, 'DnsName', { value: 'dliu.com' });
    new cdk.CfnOutput(this, 'AlbDnsName', { value: alb.loadBalancerDnsName });

  }
}
