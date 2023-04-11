module.exports = {
  graphqlQuery: (z, opts = {}) => {
    const { team, accessToken, query, variables = {}, responseCb } = opts;
    const options = {
      url: "https://cloud.yepcode.io/api/graphql",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(team ? { "yep-team": team } : {}),
      },
      body: {
        query,
        variables,
      },
    };

    return z.request(options).then((response) => {
      response.throwForStatus();
      return responseCb ? responseCb(response) : response;
    });
  },
};
