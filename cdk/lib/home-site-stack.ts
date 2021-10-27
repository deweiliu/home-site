import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ecs_patterns from '@aws-cdk/aws-ecs-patterns';
import * as route53 from '@aws-cdk/aws-route53';
import { Duration } from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { ApplicationProtocol, } from '@aws-cdk/aws-elasticloadbalancingv2';
import { Connections, SecurityGroup } from '@aws-cdk/aws-ec2';

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const domainName = 'dliu.com';
    const hostedZone = route53.HostedZone.fromHostedZoneId(this, 'HostedZone', cdk.Fn.importValue('DLIUCOMHostedZoneID').toString());
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const vpc = new ec2.Vpc(this, "VPC");
    const cluster = new ecs.Cluster(this, "Cluster", { vpc });

    const fargate = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "Fargate", {
      cluster: cluster,
      taskImageOptions: { image: ecs.ContainerImage.fromRegistry("deweiliu/home-site:latest") },
      publicLoadBalancer: true,
      redirectHTTP: true,
      certificate,
      recordType: ecs_patterns.ApplicationLoadBalancedServiceRecordType.ALIAS,
      serviceName: 'home-site',
      domainName,
      domainZone:{ ...hostedZone, zoneName: domainName }
    });

    // const cname = new route53.ARecord(this, 'HomeSiteCName', {
    //   target:{aliasTarget:{}},
    //   zone: { ...hostedZone, zoneName: domainName },
    //   ttl: Duration.hours(1),
    // });

    new cdk.CfnOutput(this, 'HomeSiteDNSName', { value: domainName });
  }
}
