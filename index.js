exports.handler = async (event) => {
    console.log({ event })
    const response = {
        statusCode: 200,
        body: JSON.stringify({ msg: "hasdfdsafi", event }),
    };
    return response;
};