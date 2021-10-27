import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import { VpcStack } from './vpc-stack';
import { EcsStack } from './ecs-stack';
import { LoadBalancingStack } from './load-balancing-stack';
import * as alias from '@aws-cdk/aws-route53-targets';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: cdk.Fn.importValue('DLIUCOMHostedZoneID').toString(),
      zoneName: 'dliu.com',
    });

    const vpcStack = new VpcStack(this, 'VPC');

    const elbStack = new LoadBalancingStack(this, 'LoadBalancing',
      { vpc: vpcStack.vpc, hostedZone, }
    );

    const ecs = new EcsStack(this, 'ECS',
      {
        vpc: vpcStack.vpc,
        albTargetGroup: elbStack.albTargetGroup,
        elbSecurityGroup: elbStack.elbSecurityGroup,
      });

    new route53.ARecord(this, "AliasRecord",
      {
        zone: hostedZone,
        target: route53.RecordTarget.fromAlias(new alias.LoadBalancerTarget(elbStack.loadBalancer)),
      });

    new cdk.CfnOutput(this, 'DNSName', { value: hostedZone.zoneName });

  }
}
