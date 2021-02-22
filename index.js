// 
const { argv } = require("process");
const fetch = require("node-fetch");
const { compact, uniqBy } = require("lodash");

const commits = argv.slice(2);

const getAllMRs = async (cursor = "") => {
  const query = `{
  project(fullPath: "tezos/tezos") {
    mergeRequests(state: merged, targetBranches: "master", after: "${cursor}") {
      count
      pageInfo {
        endCursor
        startCursor
        hasNextPage
      }
      nodes {
        iid
        title
        webUrl
        commitsWithoutMergeCommits {
          nodes {
            id
          }
        }
      }
    }
  }
}`;

  const results = await fetch("https://gitlab.com/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query }),
  }).then((r) => r.json());
  const {
    data: {
      project: {
        mergeRequests: { count, pageInfo, nodes },
      },
    },
  } = results;
  if (pageInfo.hasNextPage) {
    return [...nodes, ...(await getAllMRs(pageInfo.endCursor))];
  } else {
    return nodes;
  }
};

(async () => {
  const prefix = "gid://gitlab/CommitPresenter/";
  try {
    const allMrs = (await getAllMRs()).map(
      ({ iid, title, webUrl, commitsWithoutMergeCommits: { nodes } }) => ({
        iid,
        title,
        webUrl,
        commits: nodes.map((x) => x.id.slice(prefix.length)),
      })
    );

    const dictionary = allMrs.reduce(
      (prev, { iid, title, webUrl, commits }) => {
        for (const commit of commits) {
          prev[commit] = { iid, title, webUrl };
        }
        return prev;
      },
      {}
    );

    for (const mr of uniqBy(
      compact(commits.map((x) => dictionary[x])),
      "webUrl"
    )) {
      console.log(mr.title);
      console.log(mr.webUrl);
    }
  } catch (error) {
    console.error(error);
  }
})();
