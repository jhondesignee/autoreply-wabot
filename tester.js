const data = {
  groupName: "",
  senderName: "+55 8 7766778",
  isMessageFromGroup: false,
  messageDateTime: Date.now(),
  receiveMessageAppId: "com.tester.io",
  receiveMessagePattern: ["*"],
  senderMessage: "/test"
}

fetch("http://localhost:3000", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(data)
}).then((response) => {
    return response.json()
  })
  .then((json) => {
    console.log(JSON.stringify(json, null, 2))
  }).catch((error) => {
    console.log(error)
  })
