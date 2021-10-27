import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';

export interface EcsStackProps extends cdk.NestedStackProps {
    vpc: ec2.IVpc;
    albTargetGroup: elb.IApplicationTargetGroup;
    elbSecurityGroup: ec2.ISecurityGroup;
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
        securityGroup.connections.allowFrom(props.elbSecurityGroup, ec2.Port.tcp(80), 'Allow traffic from ELB');

        this.fargateService = new ecs.FargateService(this, 'Service', {
            cluster,
            taskDefinition,
            assignPublicIp: false,
            vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
            securityGroups: [securityGroup],
        });

        this.fargateService.attachToApplicationTargetGroup(props.albTargetGroup);


    }
}

