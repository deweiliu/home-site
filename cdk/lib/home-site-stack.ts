import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as acm from '@aws-cdk/aws-certificatemanager';
import { VpcStack } from './vpc-stack';
import { EcsStack } from './ecs-stack';
import { LoadBalancingStack } from './load-balancing-stack';


export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const domainName = 'dliu.com';
    const hostedZone = route53.HostedZone.fromHostedZoneId(this, 'HostedZone', cdk.Fn.importValue('DLIUCOMHostedZoneID').toString());
    const certificate = new acm.Certificate(this, 'Certificate', {
      domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const vpcStack = new VpcStack(this, 'VPC');

    const loadBalancing = new LoadBalancingStack(this, 'LoadBalancing',
      { vpc: vpcStack.vpc, certificate, }
    );
    const ecs = new EcsStack(this, 'ECS',
      {
        vpc: vpcStack.vpc,
        albTargetGroup: loadBalancing.albTargetGroup,
        elbSecurityGroup: loadBalancing.elbSecurityGroup,
      });


    // const vpc = new ec2.Vpc(this, "VPC");
    // const cluster = new ecs.Cluster(this, "Cluster", { vpc });

    // const fargate = new ecs_patterns.ApplicationLoadBalancedFargateService(this, "Fargate", {
    //   cluster: cluster,
    //   taskImageOptions: { image: ecs.ContainerImage.fromRegistry("deweiliu/home-site:latest") },
    //   publicLoadBalancer: true,
    //   redirectHTTP: true,
    //   certificate,
    //   recordType: ecs_patterns.ApplicationLoadBalancedServiceRecordType.ALIAS,
    //   serviceName: 'home-site',
    //   domainName,
    //   domainZone:{ ...hostedZone, zoneName: domainName }
    // });

    // const cname = new route53.ARecord(this, 'HomeSiteCName', {
    //   target:{aliasTarget:{}},
    //   zone: { ...hostedZone, zoneName: domainName },
    //   ttl: Duration.hours(1),
    // });

    new cdk.CfnOutput(this, 'DNSName', { value: domainName });
    new cdk.CfnOutput(this, 'loadBalancing', { value: loadBalancing.loadBalancer.loadBalancerDnsName });

  }
}
