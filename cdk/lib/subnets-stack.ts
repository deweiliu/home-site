import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as route53 from '@aws-cdk/aws-route53';
import { PublicSubnet, Subnet } from '@aws-cdk/aws-ec2';
import { Fn } from '@aws-cdk/core';

export interface SubnetsStackProps extends cdk.NestedStackProps {
    vpc: ec2.IVpc;
    maxAzs: number;
    appId: number;
    igwId: string;

}
export class SubnetsStack extends cdk.NestedStack {
    public vpc: ec2.Vpc;
    public subnets: Subnet[] = [];
    constructor(scope: cdk.Construct, id: string, props: SubnetsStackProps) {
        super(scope, id, props);

        [...Array(props.maxAzs).keys()].forEach(azIndex => {
            const subnet = new PublicSubnet(this, `Subnet` + azIndex, {
                vpcId: props.vpc.vpcId,
                availabilityZone: Fn.select(azIndex, props.vpc.availabilityZones),
                cidrBlock: `10.0.${props.appId}.${azIndex * 16}/28`,
                mapPublicIpOnLaunch: true,
            });
            new ec2.CfnRoute(this, 'PublicRouting' + azIndex, {
                destinationCidrBlock: '0.0.0.0/0',
                routeTableId: subnet.routeTable.routeTableId,
                gatewayId: props.igwId,
            });

            this.subnets.push(subnet);
        });

        // this.vpc = new ec2.Vpc(this, 'VPC', {
        //     cidr: "10.2.0.0/16", // to change
        //     subnetConfiguration: [{ cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC, name: 'public-subnet-group' }],
        //     maxAzs: props.maxAzs,
        // });


        // const peer = new ec2.CfnVPCPeeringConnection(this, "HomeSiteVPCPeering", {
        //     vpcId: this.vpc.vpcId,
        //     peerVpcId: props.albVpc.vpcId,
        // });

        // this.vpc.publicSubnets.forEach(({ routeTable: { routeTableId } }, index) => {

        //     new ec2.CfnRoute(this, 'RouteServiceToALB' + index, {
        //         destinationCidrBlock: props.albVpc.vpcCidrBlock,
        //         routeTableId,
        //         vpcPeeringConnectionId: peer.ref,
        //     });
        // });

        // // Add route from the private subnet of the second VPC to the first VPC over the peering connection
        // for (var i = 0; i < props.maxAzs; i++) {
        //     new ec2.CfnRoute(this, 'RouteALBToService' + i, {
        //         destinationCidrBlock: this.vpc.vpcCidrBlock,
        //         routeTableId: cdk.Fn.select(i, props.publicSubnetRouteTableIds),
        //         vpcPeeringConnectionId: peer.ref,
        //     });
        // }
    }
}