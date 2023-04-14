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
function showCheckInfos() {
  updateCheckValues("links");
  updateCheckValues("pressure");
  updateCheckValues("grammar");
  updateCheckValues("attachments");
  updateCheckValues("sender");

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
  mailboxItem.body.getAsync(Office.CoercionType.Text, async function (asyncResult) {
    if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
      const emailBody = asyncResult.value;
      const data = {
        messages: messages,
        body: emailBody,
      };
      const response = await fetch('http://127.0.0.1:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      const jsonResponse = await response.json();
      return jsonResponse;
    } else {
      console.error('HaraldError:', asyncResult.error.message);
    }
  });
}


async function run() {

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

  // display the response in the taskpane
  showCheckInfos();

  // change icon to red or gre  en
  changeIcon();

  const item = Office.context.mailbox.item;
  const sender = item.sender || item.from;
}
