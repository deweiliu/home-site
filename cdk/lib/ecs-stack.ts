import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';

export interface EcsStackProps extends cdk.NestedStackProps {
    vpc: ec2.IVpc;
    albSecurityGroup: ec2.ISecurityGroup;
    albListener: elb.IApplicationListener;
    albVpc: ec2.IVpc;

}


export class EcsStack extends cdk.NestedStack {
    public fargateService: ecs.FargateService;
    constructor(scope: cdk.Construct, id: string, props: EcsStackProps) {
        super(scope, id, props);

        const cluster = new ecs.Cluster(this, 'Cluster', { vpc: props.vpc, });

        const taskDefinition = new ecs.TaskDefinition(this, 'TaskDefinition', {
            compatibility: ecs.Compatibility.FARGATE,
            cpu: '256',
            memoryMiB: '512',
        });

        taskDefinition.addContainer('home-site-container', {
            image: ecs.ContainerImage.fromRegistry('deweiliu/home-site'),
            portMappings: [{ containerPort: 80 }],
        });

        const securityGroup = new ec2.SecurityGroup(this, 'ServiceSecurityGroup', { vpc: props.vpc, });
        // securityGroup.connections.allowFrom(albSecurityGroup, ec2.Port.tcp(80), 'Allow traffic from ELB');

        this.fargateService = new ecs.FargateService(this, 'Service', {
            cluster,
            taskDefinition,
            assignPublicIp: true,
            vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
            securityGroups: [securityGroup],
            desiredCount: 1, // Run 1 insance of the task
        });

        const albTargetGroup = new elb.ApplicationTargetGroup(this, 'HomeSiteTargetGroup', {
            port: 80,
            protocol: elb.ApplicationProtocol.HTTP,
            healthCheck: { enabled: true },
            vpc: props.albVpc,
            targetType: elb.TargetType.IP,
        });
        this.fargateService.attachToApplicationTargetGroup(albTargetGroup);

        new elb.ApplicationListenerRule(this, "HomeSiteListenerRule", {
            listener: props.albListener,
            priority: 5, //to change
            targetGroups: [albTargetGroup],
            conditions: [elb.ListenerCondition.sourceIps(['0.0.0.0/0'])],
        });


    }
}

