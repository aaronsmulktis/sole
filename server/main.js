import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
// import twilio from 'twilio';

// console.log(process.env);

const TWILIO_AUTH_TOKEN = Meteor.settings.TWILIO_AUTH_TOKEN,
      TWILIO_ACCOUNT_SID = Meteor.settings.TWILIO_ACCOUNT_SID,
      TWILIO_NUMBER = Meteor.settings.TWILIO_NUMBER;

const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

Meteor.publish("groups", function () {
  return Groups.find({
    owner: this.userId
  });
});

Meteor.methods({
  addGroup: function (name) {
    Groups.insert({
      name: name,
      createdAt: new Date(),
      owner: Meteor.userId(),
      checked: false,
      numbers: []
    });
  },
  addNumber: function (groupId, number) {
    Groups.update(
      {_id: groupId},
      {$addToSet: {numbers: {"number": number, "checked": true }}}
    );
  },
  deleteGroup: function (groupId) {
    Groups.remove(
        {_id: groupId}
    );
  },
  deleteNumber: function (groupId, number) {
      Groups.update(
          {_id: groupId},
          { $pull: { numbers: {"number": number}}}
      );
  },
  toggleGroup: function (groupId, toggle) {
      Groups.update(
          {_id: groupId},
          { $set: { checked: toggle}}
      );
      // Find every number that differs from Group's "checked" boolean
      var numbers =
          Groups.find(
              {numbers: { $elemMatch: {"checked": !toggle}}}
          );
      // Set all numbers to match Group's "checked" boolean
      numbers.forEach(function (setter) {
          for (var index in setter.numbers) {
              Groups.update(
                  { _id: groupId, "numbers.number": setter.numbers[index].number },
                  { $set: {"numbers.$.checked": toggle} }
              );
          }
      });
  },
  toggleNumber: function (groupId, number, toggle) {
      Groups.update(
          { _id: groupId, "numbers.number": number },
          { $set: {"numbers.$.checked": toggle} }
      );
  },
  sendMessage: function (outgoingMessage) {
    var phonebook = [];
    // Find all checked numbers across all groups
    var recipients =
        Groups.find(
            {numbers: { $elemMatch: {"checked": true}}}
        );
    // Add each number from our query to our phonebook
    recipients.forEach(function (recipient) {
        for (var index in recipient.numbers) {
            phonebook.push(recipient.numbers[index].number);
        }
    });
    // Place all numbers in a Set so no number is texted more than once
    var uniquePhoneBook = new Set(phonebook);
    // Use Twilio REST API to text each number in the unique phonebook
    uniquePhoneBook.forEach(function (number) {
        // HTTP.call(
        //     "POST",
        //     'https://api.twilio.com/2010-04-01/Accounts/' +
        //     TWILIO_ACCOUNT_SID + '/SMS/Messages.json', {
        //         params: {
        //             From: TWILIO_NUMBER,
        //             To: number,
        //             Body: outgoingMessage
        //         },
        //         // Set your credentials as environment variables
        //         // so that they are not loaded on the client
        //         auth:
        //             TWILIO_ACCOUNT_SID + ':' +
        //             TWILIO_AUTH_TOKEN
        //     },
        //     // Print error or success to console
        //     function (error) {
        //         if (error) {
        //           console.log(error);
        //         } else {
        //           console.log('SMS sent successfully.');
        //         }
        //     }
        // );
        twilio.sendMessage({
            to: number,
            from: TWILIO_NUMBER,
            body: outgoingMessage

        }, function(err, responseData) {

            if (!err) {
                // "responseData" is a JavaScript object containing data received from Twilio.
                // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
                // http://www.twilio.com/docs/api/rest/sending-sms#example-1
                console.log(responseData.from); // outputs "+14506667788"
                console.log(responseData.body); // outputs "word to your mother."

            }
        });

    });
  },
  checkMessages: function (incomingMessages) {
    var messages = [];

    HTTP.call(
      "GET",
      'https://demo.twilio.com/welcome/sms/reply/',
      function (error, response) {
        if (error) {
          console.log(error);
        } else {
          console.log(response);
        }
      }
    );
  }
});

let everyHour = new Cron(function() {
  Meteor.call("checkMessages");
}, {
  minute: 5
});

Meteor.startup(() => {

});
