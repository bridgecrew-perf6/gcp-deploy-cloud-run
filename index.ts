import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

const imageName = "my-first-gcp-app";
const config = new pulumi.Config();
const codePath = config.require('projectLocation');

// get configuration
const backendPort = config.requireNumber("backend_port");
const nodeEnvironment = config.require("node_environment");

const stack = pulumi.getStack();

const backendImageName = "backend";
const backend = new docker.Image("backend", {
    build: {
        context: `${process.cwd()}/pulumi-backend`,
    },
    imageName: `${backendImageName}:${stack}`,
    skipPush: true,
});

// create a network!
const network = new docker.Network("network", {
    name: `services-${stack}`,
});

// create the backend container!
const backendContainer = new docker.Container("backendContainer", {
    name: `backend-${stack}`,
    image: backend.baseImageName,
    ports: [
        {
            internal: backendPort,
            external: backendPort,
        },
    ],
    envs: [
        `NODE_ENV=${nodeEnvironment}`,
    ],
    networksAdvanced: [
        {
            name: network.name,
        },
    ],
}, { dependsOn: [ ]});