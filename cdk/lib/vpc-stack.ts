import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';

export interface VpcStackProps extends cdk.NestedStackProps {
    albVpc: ec2.IVpc;
    maxAzs: number;
    publicSubnetRouteTableIds: string[];
}
export class VpcStack extends cdk.NestedStack {
    public vpc: ec2.Vpc;

    constructor(scope: cdk.Construct, id: string, props: VpcStackProps) {
        super(scope, id, props);

        this.vpc = new ec2.Vpc(this, 'VPC', {
            cidr: "10.2.0.0/16", // to change
            subnetConfiguration: [{ cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC, name: 'public-subnet-group' }],
            maxAzs: props.maxAzs,
        });


        const peer = new ec2.CfnVPCPeeringConnection(this, "HomeSiteVPCPeering", {
            vpcId: this.vpc.vpcId,
            peerVpcId: props.albVpc.vpcId,
        });

        this.vpc.publicSubnets.forEach(({ routeTable: { routeTableId } }, index) => {

            new ec2.CfnRoute(this, 'RouteServiceToALB' + index, {
                destinationCidrBlock: props.albVpc.vpcCidrBlock,
                routeTableId,
                vpcPeeringConnectionId: peer.ref,
            });
        });

        // Add route from the private subnet of the second VPC to the first VPC over the peering connection
        for (var i = 0; i < props.maxAzs; i++) {
            new ec2.CfnRoute(this, 'RouteALBToService' + i, {
                destinationCidrBlock: this.vpc.vpcCidrBlock,
                routeTableId: cdk.Fn.select(i, props.publicSubnetRouteTableIds),
                vpcPeeringConnectionId: peer.ref,
            });
        }
        // props.albVpc.publicSubnets.forEach(({ routeTable: { routeTableId } }, index) => {
        //     new ec2.CfnRoute(this, 'RouteALBToService' + index, {
        //         destinationCidrBlock: this.vpc.vpcCidrBlock,
        //         routeTableId: cdk.Fn.select(i, props.publicSubnetRouteTableIds),
        //         vpcPeeringConnectionId: peer.ref,
        //     });
        // });

        // new ec2.CfnRoute(this, 'RouteALBToService' + 0, {
        //     destinationCidrBlock: this.vpc.vpcCidrBlock,
        //     routeTableId: 'rtb-04bef31089ad7670a',
        //     vpcPeeringConnectionId: peer.ref,
        // });

        // new ec2.CfnRoute(this, 'RouteALBToService' + 1, {
        //     destinationCidrBlock: this.vpc.vpcCidrBlock,
        //     routeTableId: 'rtb-08be211600064b938',
        //     vpcPeeringConnectionId: peer.ref,
        // });
    }
}