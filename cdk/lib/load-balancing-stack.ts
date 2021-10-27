import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
export interface LoadBalancingStackProps extends cdk.NestedStackProps {
    vpc: ec2.Vpc;
    certificate: acm.Certificate;
}


export class LoadBalancingStack extends cdk.NestedStack {
    public loadBalancer: elb.ApplicationLoadBalancer;
    public albTargetGroup: elb.ApplicationTargetGroup;
    public elbSecurityGroup: ec2.ISecurityGroup;
    constructor(scope: cdk.Construct, id: string, props: LoadBalancingStackProps) {
        super(scope, id, props);

        this.elbSecurityGroup = new ec2.SecurityGroup(this, 'ServiceSecurityGroup', { vpc: props.vpc, });
        this.elbSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));
        this.elbSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));

        this.loadBalancer = new elb.ApplicationLoadBalancer(this,
            'HomeSiteApplicationLoadBalancer',
            {
                vpc: props.vpc,
                http2Enabled: true,
                internetFacing: true,
                vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
                securityGroup: this.elbSecurityGroup,
            });

        this.albTargetGroup = new elb.ApplicationTargetGroup(this, 'HomeSiteTargetGroup', {
            port: 80,
            protocol: elb.ApplicationProtocol.HTTP,
            healthCheck: { enabled: true },
            vpc: props.vpc,
            targetType: elb.TargetType.IP,
        });

        this.loadBalancer.addRedirect({
            sourcePort: 80, sourceProtocol: elb.ApplicationProtocol.HTTP,
            targetPort: 443, targetProtocol: elb.ApplicationProtocol.HTTPS,
        });

        this.loadBalancer.addListener('HttpsListner', {
            port: 443,
            protocol: elb.ApplicationProtocol.HTTPS,
            defaultTargetGroups: [this.albTargetGroup],
            certificates: [props.certificate],
        });
    }
}