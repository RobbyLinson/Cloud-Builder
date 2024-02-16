const { validateVPCOptions } = require("./validationVPC.js");

test("Returns input back if successful", () => {
    expect(validateVPCOptions({
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    })).toStrictEqual({
        "DryRun": true,
        "AmazonProvidedIpv6CidrBlock": true,
        "CidrBlock": "172.0.0.0"
    });
})