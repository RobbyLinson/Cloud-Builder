import { validateVPCOptions } from "./validationVPC";

test("Returns input back if successful", () => {
    expect(validateVPCOptions({
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "Name": "abc123"
    })).toStrictEqual({
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0",
        "Name": "abc123",
        "TagSpecifications": Array [
             Object {
               "ResourceType": "vpc",
               "Tags": Array [
                    Object {
                       "Key": "Name",
                       "Value": "abc123",
                    },
                ],
             },
         ],
    });
})
