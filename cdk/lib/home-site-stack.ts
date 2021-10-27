import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as route53 from '@aws-cdk/aws-route53';
import { Duration } from '@aws-cdk/core';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "VPC");

    const cluster = new ecs.Cluster(this, "Cluster", { vpc });


    const fargate = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", {
      cluster: cluster,
      taskImageOptions: { image: ecs.ContainerImage.fromRegistry("deweiliu/home-site:latest") },
      publicLoadBalancer: true
    });

    new route53.CnameRecord(this, 'CName', {
      domainName: 'dliu.com',
      zone: route53.HostedZone.fromHostedZoneId(this, 'HostedZone', cdk.Fn.importValue('DLIUCOMHostedZoneID').toString()),
      recordName: fargate.loadBalancer.loadBalancerDnsName,
      ttl: Duration.hours(1),
    });


    // new cdk.CfnOutput(this,fargate.loadBalancer.loadBalancerDnsName)



  }
}
