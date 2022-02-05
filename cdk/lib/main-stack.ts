import { Construct } from 'constructs';
import {
  aws_route53 as route53,
  aws_ec2 as ec2,
  aws_ecs as ecs,
  aws_elasticloadbalancingv2 as elb,
  aws_certificatemanager as acm,
  StackProps,
  Stack,
  CfnOutput,
  aws_route53_targets as alias,
} from 'aws-cdk-lib';


import { ImportValues } from './import-values';

export interface CdkStackProps extends StackProps {
  maxAzs: number;
  appId: number;
  domain: string;
  appName: string;
  instanceCount: number;
}
export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    const get = new ImportValues(this, props);

    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'TaskDefinition', { networkMode: ecs.NetworkMode.BRIDGE });

    taskDefinition.addContainer('Container', {
      image: ecs.ContainerImage.fromRegistry(get.dockerImage),
      containerName: `${get.appName}-container`,
      memoryReservationMiB: 32,
      portMappings: [{ containerPort: 80, hostPort: get.hostPort, protocol: ecs.Protocol.TCP }],
      logging: new ecs.AwsLogDriver({ streamPrefix: get.appName }),
    });

    const service = new ecs.Ec2Service(this, 'Service', {
      cluster: get.cluster,
      taskDefinition,
      desiredCount: get.instanceCount,
    });
    get.clusterSecurityGroup.connections.allowFrom(get.albSecurityGroup, ec2.Port.tcp(get.hostPort), `Allow traffic from ELB for ${get.appName}`);

    const albTargetGroup = new elb.ApplicationTargetGroup(this, 'TargetGroup', {
      port: 80,
      protocol: elb.ApplicationProtocol.HTTP,
      healthCheck: { enabled: true },
      vpc: get.vpc,
      targetType: elb.TargetType.INSTANCE,
      targets: [service],
    });

    new elb.ApplicationListenerRule(this, "ListenerRule", {
      listener: get.albListener,
      priority: get.priority,
      targetGroups: [albTargetGroup],
      conditions: [elb.ListenerCondition.hostHeaders([get.dnsName])],
    });

    const certificate = new acm.Certificate(this, 'SSL', {
      domainName: get.dnsName,
      validation: acm.CertificateValidation.fromDns(get.hostedZone),
    });
    get.albListener.addCertificates('AddCertificate', [certificate]);

    const record = new route53.ARecord(this, "AliasRecord", {
      zone: get.hostedZone,
      target: route53.RecordTarget.fromAlias(new alias.LoadBalancerTarget(get.alb)),
    });

    new CfnOutput(this, 'DnsName', { value: record.domainName });
  }
}
