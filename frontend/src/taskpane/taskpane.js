/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office */

Office.onReady((info) => {
  if (info.host === Office.HostType.Outlook) {
    run();
  }
});

async function checkEmailFor(emailDataJson, checkType) {
  const response = await fetch(`http://127.0.0.1:5000/check_${checkType}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: emailDataJson,
  })

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return await response.json();
}

async function updateCheckValues(checkType) {
  const mailboxItem = Office.context.mailbox.item;
  const subject = mailboxItem.subject;
  const from = mailboxItem.from;
  const to = mailboxItem.to;
  const cc = mailboxItem.cc;
  const dateTimeCreated = mailboxItem.dateTimeCreated;
  const dateTimeModified = mailboxItem.dateTimeModified;

  mailboxItem.body.getAsync(Office.CoercionType.Html, async function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const emailBody = asyncResult.value;

      const emailData = {
        subject,
        from,
        to,
        cc,
        dateTimeCreated,
        dateTimeModified,
        body: emailBody,
      };
      const emailDataJson = JSON.stringify(emailData, null, 2);
      // console.log(jsonString);

      // send body to backend at http://127.0.0.1:5000 and return results 
      const checkResults = await checkEmailFor(emailDataJson, checkType);
      console.log('Success:', checkResults);

      // change value in HTML

      document.getElementById(`${checkType}-check-value`).innerHTML = Math.round(checkResults * 100).toString() + "%";
      document.getElementById(`${checkType}-check-value`).classList.remove("is-loading");
      if (checkResults < 0.2)
        document.getElementById(`${checkType}-check-value`).classList.add("is-success");
      else if (checkResults < 0.5)
        document.getElementById(`${checkType}-check-value`).classList.add("is-warning");
      else
        document.getElementById(`${checkType}-check-value`).classList.add("is-danger");

    } else {
      console.error('Error:', asyncResult.error.message);
    }
  });
}
function showAndReturnCheckInfos() {
  return {
    "links score": updateCheckValues("links"),
    "pressure score": updateCheckValues("pressure"),
    "grammar score": updateCheckValues("grammar"),
    "attachments score": updateCheckValues("attachments"),
    "sender score": updateCheckValues("sender"),
  }
}
function showCheckInfosDEMO() {
  setTimeout(function () {
    // change item with id grammar-check-value to good
    document.getElementById("grammar-check-value").innerHTML = "Good";
    document.getElementById("grammar-check-value").style.color = "green";
  }, 2000);

  setTimeout(function () {
    // change item with id links-check-value to good
    document.getElementById("links-check-value").innerHTML = "Bad";
    document.getElementById("links-check-value").style.color = "red";
  }, 3000);

  setTimeout(function () {
    // change item with id pressure-check-value to good
    document.getElementById("pressure-check-value").innerHTML = "Good";
    document.getElementById("pressure-check-value").style.color = "green";
  }, 1500);
}

function changeIcon() {

}

async function ask(messages) {
  const data = {
    messages: messages,
  };
  console.log("data: ", data)
  const response = await fetch('http://127.0.0.1:5000/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  console.log("response: ", data)
  const jsonResponse = await response.json();
  return jsonResponse;
}


async function run() {

  initChatBot();

  // console.log(await ask([
  //   {
  //     role: "system",
  //     content: "You are a helpful assistant."
  //   },
  //   {
  //     role: "user",
  //     content: "What is 3 * 5?"
  //   }
  // ]))
  var prompt = "";

  const mailboxItem = Office.context.mailbox.item;
  mailboxItem.body.getAsync(Office.CoercionType.Text, async function (asyncResult) {
    console.log("entered")
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const emailBody = asyncResult.value;
      prompt += "Act like you are a Spam email assistant. I give you the content of an email and the result of spam checks that I have performed on the mail programmatically.\n\nExplain to me why the spam scores are the way they are. Do not come up with your own classification of the email. Just explain the scores, that my spam checks have given the mai. Answer me short and to the point. If possible, try to include the context of the mail in your answer."
      prompt += "\n\nAll spam scores that I provide you with are a number between 0 and 1. If the score is close to 0, it indicates, that this score detected no spam. If the score is close to 1, it indicates, that this score detected spam.";
      prompt += "\nHere a short explanations what the scores mean.\ngrammar: is the grammar of the mail is bad, its more likely to be spam\nsender: does the sender email match the displayed name. If not, its more likely to be spam\nlinks: are malicous links found\npressure: does the mail contain tactics to put pressure on the receiver. If yes, its more likely to be spam\nattachments: does the mail contain malicious attachments"
      prompt += "\n\nspam checks:\n";

      prompt += JSON.stringify(showAndReturnCheckInfos());

      prompt += "\n\nEmail:\n";
      prompt += emailBody;
    } else {
      console.log('HaraldError:', asyncResult.error.message);
    }
  });

  // display the response in the taskpane
  const checkResults = { "role": "user", "content": prompt };
  messages.push(checkResults)
  console.log("messages: ", messages)
  sendMessage(messages);

  // change icon to red or gre  en
  changeIcon();

  const item = Office.context.mailbox.item;
  const sender = item.sender || item.from;
}

var messages = [
  { "role": "system", "content": "You are a helpful assistant." },
]

const chatWindow = document.querySelector('.chat-window');
const closeChatBtn = document.querySelector('.close-btn');
const input = document.querySelector('.input-container input[type="text"]');
const sendBtn = document.querySelector('.input-container button[type="submit"]');

function initChatBot() {


  // Hide the chat window when the close button is clicked
  closeChatBtn.addEventListener('click', function () {
    chatWindow.style.display = 'none';
  });

  // Send a message when the user hits enter or clicks the send button
  input.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);
}


// Send a message and add it to the chat window
function sendMessage(arg) {
  let messageText = input.value.trim();
  if (arg) {
    messageText = arg
  }

  if (messageText && !arg) {
    const message = document.createElement('div');
    message.classList.add('chat-message');

    const sender = document.createElement('span');
    sender.classList.add('sender');
    sender.textContent = 'You: ';

    const messageContent = document.createElement('span');
    messageContent.classList.add('message-text');
    messageContent.textContent = messageText;

    message.appendChild(sender);
    message.appendChild(messageContent);

    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.appendChild(message);

    messages.push({ "role": "user", "content": messageText })

    ask(messages).then(function (jsonResponse) {
      console.log("got response")
      console.log(jsonResponse.msg)

      messages = jsonResponse.msg
      // get last element
      const lastText = messages[messages.length - 1]['content']

      const responseMessage = document.createElement('div');
      responseMessage.classList.add('chat-message');

      const sender = document.createElement('span');
      sender.classList.add('sender');
      sender.textContent = 'ChatGPT: ';

      const messageContent = document.createElement('span');
      messageContent.classList.add('message-text');
      messageContent.textContent = lastText;

      responseMessage.appendChild(sender);
      responseMessage.appendChild(messageContent);

      chatMessages.appendChild(responseMessage);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    })


    input.value = '';
  }
  else {
    ask(messages).then(function (jsonResponse) {
      console.log("got response")
      console.log(jsonResponse.msg)

      messages = jsonResponse.msg
      // get last element
      const lastText = messages[messages.length - 1]['content']

      const responseMessage = document.createElement('div');
      responseMessage.classList.add('chat-message');

      const sender = document.createElement('span');
      sender.classList.add('sender');
      sender.textContent = 'ChatGPT: ';

      const messageContent = document.createElement('span');
      messageContent.classList.add('message-text');
      messageContent.textContent = lastText;

      responseMessage.appendChild(sender);
      responseMessage.appendChild(messageContent);

      chatMessages.appendChild(responseMessage);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    })

    input.value = '';
  }
}