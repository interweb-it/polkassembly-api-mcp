import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import express from "express";
import { z } from "zod";
import axios from "axios";

const app = express();

const server = new McpServer({
  name: "polkassembly-api-mcp",
  version: "1.0.0",
});

// server.tool("polkassembly-api", "A tool for the polkassembly api", {
//   input: z.string().describe("The input to the tool"),
// }, async ({ input }) => {
//   return {
//     content: [{ type: "text", text: `Processed: ${input}` }],
//   };
// });

let transport: SSEServerTransport | null = null;

// ref: https://docs.polkassembly.io/jekyll/2023-10-17-api-and-resources.html#base-url

const baseUrl = "https://api.polkassembly.io/api";
// var network = "kusama";
const getHeaders = (network: string) => {
  return {
    "Content-Type": "application/json",
    "x-network": network,
  }
}

// server.prompt("required-params", ({input}) => {
//   console.log("required-params", input);
//   return {
//     content: [{ type: "text", text: "if not provided, prompt the user for any required parameters" }],
//   };
// });

/**
 * GET /v1/posts/on-chain-post
 * Parameters:
 *   - network (required): The network to use (e.g., 'kusama', 'polkadot')
 *   - postId (required): The ID of the post
 *   - proposalType (required): The type of proposal (e.g., 'referendums_v2', 'treasury_proposals', 'bounties')
 */
server.tool("get-on-chain-post", "Get an on-chain post", {
  input: z.object({
    network: z.string().describe("Required: The network to use (e.g., 'kusama', 'polkadot')"),
    postId: z.string().describe("Required: The ID of the post"),
    proposalType: z.string().describe("Required: The type of proposal (e.g., 'referendums_v2', 'treasury_proposals', 'bounties', 'referendums')"),
  }),
}, async ({ input }) => {
  console.log("get-on-chain-post", input);
  const network = input.network;
  const headers = getHeaders(network);
  try {
    const url = `${baseUrl}/v1/posts/on-chain-post?postId=${input.postId}&proposalType=${input.proposalType}`;
    const response = await axios.get(url, { headers: headers });
    console.log("get-on-chain-post", url, headers);
    const data = response.data;
    // console.log("get-on-chain-post", data);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    console.error("get-on-chain-post", error);
    return {
      content: [{ type: "text", text: `Error: ${error}` }],
    };
  }
});

/**
 * POST /v1/posts/comments/getCommentsByTimeline 
 * Parameters:
 *   - network (required): The network to use (e.g., 'kusama', 'polkadot')
 *   - postId (required): The ID of the post
 *   - proposalType (required): The type of proposal (e.g., 'referendums_v2', 'treasury_proposals', 'bounties')
 */
server.tool("get-comments-by-timeline", "Get comments by timeline. Note: it is best to get-on-chain-post first to check the postId and proposalType.", {
  input: z.object({
    network: z.string().describe("Required: The network to use (e.g., 'kusama', 'polkadot')"),
    postId: z.string().describe("Required: The ID of the post"),
    proposalType: z.string().describe("Required: The type of proposal (e.g., 'referendums_v2', 'treasury_proposals', 'bounties', 'referendums')"),
  }),
}, async ({ input }) => {
  console.log("get-comments-by-timeline", input);
  const network = input.network;
  const headers = getHeaders(network);
  try {
    const url = `${baseUrl}/v1/posts/comments/getCommentsByTimeline`;
    const body = {
      postId: input.postId,
      proposalType: input.proposalType,
    };
    console.log("get-comments-by-timeline", url, headers, body);
    const response = await axios.post(url, body, { headers });
    console.log("get-comments-by-timeline", url, headers);
    const data = response.data;
    // console.log("get-comments-by-timeline", data);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    console.error("get-comments-by-timeline", error);
    return {
      content: [{ type: "text", text: `Error: ${error}` }],
    };
  }
});


/**
 * POST /v1/votes/total
 * Parameters:
 *   - network (required): The network to use (e.g., 'kusama', 'polkadot')
 *   - proposalType (required): The type of proposal (e.g., 'referendums_v2', 'treasury_proposals', 'bounties', 'referendums')
 *   - postId (required): The ID of the post
 */
server.tool("get-votes", "Get the votes for a post", {
  input: z.object({
    network: z.string().describe("Required: The network to use (e.g., 'kusama', 'polkadot')"),
    voteType: z.string().describe("Required: The type of proposal/vote (e.g., 'referendums_v2', 'treasury_proposals', 'bounties', 'referendums')"),
    postId: z.string().describe("Required: The ID of the post"),
    page: z.number().describe("Optional: The page number to get"),
    listingLimit: z.number().describe("Optional: The number of items per page"),
    sortBy: z.string().describe("Optional: The sort order (e.g., 'balance', 'time')"),
  }),
}, async ({ input }) => {
  console.log("get-votes-total", input);
  const network = input.network;
  const headers = getHeaders(network);
  try {
    const url = `${baseUrl}/v1/votes`;
    const body = {
      postId: input.postId,
      voteType: input.voteType,
      page: input.page ? input.page : 1,
      listingLimit: input.listingLimit ? input.listingLimit : 10,
      sortBy: input.sortBy ? input.sortBy : 'balance',
    };
    console.log("get-votes-total", url, headers, body);
    const response = await axios.post(url, body, { headers });
    const data = response.data;
    // console.log("get-votes", data);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    console.error("get-votes-total", error);
    return {
      content: [{ type: "text", text: `Error: ${error}` }],
    };
  }
});

/**
 * POST /v1/votes/ayeNayTotalCount  
 * Parameters:
 *   - network (required): The network to use (e.g., 'kusama', 'polkadot')
 *   - proposalType (required): The type of proposal (e.g., 'referendums_v2', 'treasury_proposals', 'bounties', 'referendums')
 *   - postId (required): The ID of the post
 */
server.tool("get-aye-nay-total-count", "Get the aye/nay total count for a post", {
  input: z.object({
    network: z.string().describe("Required: The network to use (e.g., 'kusama', 'polkadot')"),
    proposalType: z.string().describe("Required: The type of proposal (e.g., 'referendums_v2', 'treasury_proposals', 'bounties', 'referendums')"),
    postId: z.string().describe("Required: The ID of the post"),
  }),
}, async ({ input }) => {
  console.log("get-aye-nay-total-count", input);
  const network = input.network;
  const headers = getHeaders(network);
  try {
    const url = `${baseUrl}/v1/votes/ayeNayTotalCount`;
    const body = {
      postId: input.postId,
      proposalType: input.proposalType,
    };
    console.log("get-aye-nay-total-count", url, headers, body);
    const response = await axios.post(url, body, { headers });
    const data = response.data;
    // console.log("get-aye-nay-total-count", data);
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    console.error("get-aye-nay-total-count", error);
    return {
      content: [{ type: "text", text: `Error: ${error}` }],
    };
  }
});

// TODO: returns 400 error
// /**
//  * POST /v1/votes/history
//  * Parameters:
//  *   - network (required): The network to use (e.g., 'kusama', 'polkadot')
//  *   - proposalType (required): The type of proposal (e.g., 'referendums_v2', 'treasury_proposals', 'bounties', 'referendums')
//  *   - postId (required): The ID of the post
//  */
// server.tool("get-votes-history", "Get the vote history for a post", {
//   input: z.object({
//     network: z.string().describe("The network to use (e.g., 'kusama', 'polkadot')"),
//     voterAddress: z.string().describe("The address of the voter"),
//     page: z.number().describe("The page number to get"),
//     listingLimit: z.number().describe("The number of items per page"),
//   }),
// }, async ({ input }) => {
//   console.log("get-votes-history", input);
//   const network = input.network;
//   const headers = getHeaders(network);
//   try {
//     const url = `${baseUrl}/v1/votes/history`;
//     const body = {
//       voterAddress: input.voterAddress,
//       page: input.page ? input.page : 1,
//       listingLimit: input.listingLimit ? input.listingLimit : 10,
//     };
//     console.log("get-votes-history", url, headers, body);
//     const response = await axios.post(url, body, { headers });
//     const data = response.data;
//     // console.log("get-votes-history", data);
//     return {
//       content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
//     };
//   } catch (error) {
//     console.error("get-votes-history", error);
//     return {
//       content: [{ type: "text", text: `Error: ${error}` }],
//     };
//   }
// });

/**
 * GET /v1/listing/on-chain-posts
 * Parameters:
 *   - network (required): The network to use (e.g., 'kusama', 'polkadot')
 *   - proposalType (required): The type of proposal (e.g., 'referendums_v2', 'treasury_proposals', 'bounties', 'referendums')
 */
server.tool("listing-on-chain-posts", "Get the on-chain posts", {
  input: z.object({
    network: z.string().describe("Required: The network to use (e.g., 'kusama', 'polkadot')"),
    page: z.number().describe("Optional: The page number to get"),
    listingLimit: z.number().describe("Optional: The number of items per page"),
    trackNo: z.number().describe("Optional: Track number (if proposalType === referendums_v2)"),
    trackStatus: z.string().describe("Optional: Track status 'All', 'Confirmed', 'ConfirmStarted', 'Cancelled', 'Deciding', 'DecisionDepositPlaced', 'Killed', 'Submitted', 'Rejected', 'TimedOut' (if proposalType === referendums_v2)"),
    proposalType: z.string().describe("Required: The type of proposal (e.g., 'referendums_v2', 'treasury_proposals', 'bounties', 'referendums')"),
    sortBy: z.string().describe("Optional: The sort order (e.g., 'commented', 'newest', 'oldest')"),
  }),
}, async ({ input }) => {
  console.log("listing-on-chain-posts", input);
  const network = input.network;
  const headers = getHeaders(network);
  try {
    const url = `${baseUrl}/v1/listing/on-chain-posts`;
    const params = {
      page: input.page ? input.page : 1,
      listingLimit: input.listingLimit ? input.listingLimit : 10,
      trackNo: input.trackNo ? input.trackNo : null,
      trackStatus: input.trackStatus ? input.trackStatus : null,
      proposalType: input.proposalType,
      sortBy: input.sortBy ? input.sortBy : 'commented',
    };
    console.log("listing/on-chain-posts", url, headers, params);
    const response = await axios.get(url, { headers, params });
    const data = response.data;
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    console.error("listing-on-chain-posts", error);
    return {
      content: [{ type: "text", text: `Error: ${error}` }],
    };
  }
});

/**
 * GET /v1/listing/off-chain-posts
 * Parameters:
 *   - network (required): The network to use (e.g., 'kusama', 'polkadot')
 *   - proposalType (required): The type of proposal (e.g., 'discussions', 'grants')
 */
server.tool("listing-off-chain-posts", "Get the off-chain posts", {
  input: z.object({
    network: z.string().describe("Required: The network to use (e.g., 'kusama', 'polkadot')"),
    page: z.number().describe("Optional: The page number to get"),
    listingLimit: z.number().describe("Optional: The number of items per page"),
    proposalType: z.string().describe("Required: The type of proposal (e.g., 'discussions', 'grants')"),
    sortBy: z.string().describe("Optional: The sort order (e.g., 'commented', 'newest', 'oldest')"),
  }),
}, async ({ input }) => {
  console.log("listing-off-chain-posts", input);
  const network = input.network;
  const headers = getHeaders(network);
  try {
    const url = `${baseUrl}/v1/listing/off-chain-posts`;
    const params = {
      page: input.page ? input.page : 1,
      listingLimit: input.listingLimit ? input.listingLimit : 10,
      sortBy: input.sortBy ? input.sortBy : 'commented',
    };
    console.log("listing-off-chain-posts", url, headers, params);
    const response = await axios.get(url, { headers, params });
    const data = response.data;
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    console.error("listing/on-chain-posts", error);
    return {
      content: [{ type: "text", text: `Error: ${error}` }],
    };
  }
});

/**
 * POST /v1/listing/posts-by-address
 * Parameters:
 *   - network (required): The network to use (e.g., 'kusama', 'polkadot')
 *   - proposerAddress (required): The address of the user
 */
server.tool("listing/posts-by-address", "Get the posts by address", {
  input: z.object({
    network: z.string().describe("Required: The network to use (e.g., 'kusama', 'polkadot')"),
    proposerAddress: z.string().describe("Required: The address of the user"),
  }),
}, async ({ input }) => {
  console.log("get-posts-by-address", input);
  const network = input.network;
  const headers = getHeaders(network);
  try {
    const url = `${baseUrl}/v1/listing/posts-by-address`;
    const params = {
      proposerAddress: input.proposerAddress,
    };
    console.log("get-posts-by-address", url, headers, params);
    const response = await axios.get(url, { headers, params });
    const data = response.data;
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    };
  } catch (error) {
    console.error("get-posts-by-address", error);
    return {
      content: [{ type: "text", text: `Error: ${error}` }],
    };
  }
});


// TODO: returns 400 error
// /**
//  * POST /v1/users/user-activities
//  * Parameters:
//  *   - network (required): The network to use (e.g., 'kusama', 'polkadot')
//  *   - address (required): The address of the user
//  */
// server.tool("get-user-activities", "Get the activities of a user", {
//   input: z.object({
//     network: z.string().describe("The network to use (e.g., 'kusama', 'polkadot')"),
//     address: z.string().describe("The address of the user"),
//   }),
// }, async ({ input }) => {
//   console.log("get-user-activities", input);
//   const network = input.network;
//   const headers = getHeaders(network);
//   try {
//     const url = `${baseUrl}/v1/users/user-activities`;
//     const body = {
//       address: input.address,
//     };
//     console.log("get-user-activities", url, headers, body);
//     const response = await axios.post(url, body, { headers });
//     const data = response.data;
//     // console.log("get-user-activities", data);
//     return {
//       content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
//     };
//   } catch (error) {
//     console.error("get-user-activities", error);
//     return {
//       content: [{ type: "text", text: `Error: ${error}` }],
//     };
//   }
// });



// log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get("/sse", (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  server.connect(transport);
});

// not needed
// app.post("/sse", (req, res) => {
//   transport = new SSEServerTransport("/messages", res);
//   server.connect(transport);
// });

app.post("/messages", (req, res) => {
  if (transport) {
    transport.handlePostMessage(req, res);
  }
});

app.listen(3001, '0.0.0.0');
