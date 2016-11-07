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

Meteor.publish("messages", function () {
  return Messages.find({});
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
    let phonebook = [];
    // Find all checked numbers across all groups
    let recipients =
        Groups.find(
            {numbers: { $elemMatch: {"checked": true}}}
        );
    console.log(recipients);
    // Add each number from our query to our phonebook
    recipients.forEach(function (recipient) {
        for (var index in recipient.numbers) {
          phonebook.push(recipient.numbers[index].number);
        }
    });
    console.log(phonebook);
    // Place all numbers in a Set so no number is texted more than once
    let uniquePhoneBook = new Set(phonebook);

    uniquePhoneBook.forEach(function (number, options) {
      try {
        let result = twilio.sendMessage({
          to: number,
          from: TWILIO_NUMBER,
          body: outgoingMessage
        });
      } catch (err) {
        throw new Meteor.error(err);
      } finally {
        result.type = "outgoing";
        let smsId = Messages.insert(result);
        result._id = smsId;
        console.log("New message sent:", result);
        return result;
      }
    });
  }
});

Picker.route('/reply', function(params, req, res, next) {
  req.method == "POST";
  var twilio = require('twilio');
  var twiml = new twilio.TwimlResponse();
  if (!req.query) {
    twiml.message('What you gonna say next');
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  } else {
    if (req.query.Body == 'hello') {
      twiml.message('Hi!');
    } else if(req.query.Body == 'bye') {
      twiml.message('Goodbye');
    } else {
      twiml.message("Wonder what you're gonna say next.");
    }
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  }
});

// let everyHour = new Cron(function() {
//   Meteor.call("checkMessages");
// }, {
//   minute: 5
// });

Meteor.startup(() => {
  let getTwilioMessages = Meteor.wrapAsync(twilio.messages.list, twilio.messages);

  function updateMessages () {
    getTwilioMessages(function (err, data) {
      if (err) {
        console.warn("There was an error getting data from twilio", err);
        return
      } else {
        data.messages.forEach(function (message) {
          if (Messages.find({sid: message.sid}).count() > 0) {
            return;
          }
          if (message.from === Meteor.settings.TWILIO_NUMBER) {
            message.type = "outgoing";
          } else {
            message.type = "incoming";
          }
          Messages.insert(message);
        });
      }
    });
  }

  updateMessages();
  Meteor.setInterval(updateMessages, 60000);
});
