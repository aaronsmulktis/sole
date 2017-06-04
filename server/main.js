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

// Server side routes
Picker.route('/reply', function(params, req, res, next) {
  let incomingMessage = params.query.Body,
      said = incomingMessage.toLowerCase();
  //     natural = require('natural'),
  //     classifier = new natural.BayesClassifier(),
  //     // classifier = new natural.LogisticRegressionClassifier(),
  //     tokenizer = new natural.WordTokenizer(),
  //     tokens = tokenizer.tokenize(said);

  var twilio = require('twilio');
  var twiml = new twilio.TwimlResponse();
  
  console.log(said);
  // let classState = [
  //   // "wants", "needs", "cans", "musts"
  // ];
  // let classActions = [];
  // let classLocations = [];
  // let wants = ['can i','want', 'please', 'can', 'will there', 'can he', 'can she'];

  Meteor.call('classifyMessage', said, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      console.log(res);
      if (res === "wants") {
        // console.log(res);
        twiml.message("i see you wantin");
      } else {
        // console.log(res);
        Meteor.call("trainNLP", said, function(err, res) {
          if (err) {
            throw new Meteor.Error(err);
          } else {
            return res
          }
        });

        twiml.message("whatevs");
      }
    }
  });

  // natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {
  //   // console.log(classifier.classify(said));
  //   messageClass = classifier.classify(said);

  req.method == "POST";

  // Maybe should be xml?
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
});

// Events and methods
Meteor.methods({
  trainNLP: function(msg) {
    // console.log(msg);
    let said = msg,
        natural = require('natural'),
        classifier = new natural.BayesClassifier(),
        // classifier = new natural.LogisticRegressionClassifier(),
        tokenizer = new natural.WordTokenizer(),
        tokens = tokenizer.tokenize(said);

    natural.PorterStemmer.attach();

    // Training
    if (tokens.indexOf("want") !== -1) {
      classifier.addDocument(msg, 'wants');
      classifier.train();

      classifier.save('classifier.json', function(err, classifier) {
        if (err) {
          throw new Meteor.Error("couldn't save");
          console.log('it didnt save')
        } else {
          return true;
          console.log(classifier.docs);
        }
      });
      // If you wanna classify each word
      // tokens.forEach(function(item) {
      //   // let stem = item.stem();
      //   // Should conditionally classify the incoming words
      //   // classIt(stem, )

      // });
      // twiml.message("you want something");

    } else if (tokens.indexOf("need") !== -1) {
      classifier.addDocument(msg, 'needs');
      classifier.train();
      classifier.save('classifier.json', function(err, classifier) {
        if (err) {
          throw new Meteor.Error("couldn't save");
          console.log('it didnt save')
        } else {
          return true;
          console.log(classifier.docs);
        }
      });
      // If you wanna classify each word
      // tokens.forEach(function(item) {
      //   // let stem = item.stem();
      //   // Should conditionally classify the incoming words
      //   // classIt(stem, )
      // });
      // twiml.message("you need something");
    } else {
      classifier.addDocument(msg, 'other');
      classifier.train();
      classifier.save('classifier.json', function(err, classifier) {
        if (err) {
          throw new Meteor.Error("couldn't save");
          console.log('it didnt save')
        } else {
          return true;
          console.log(classifier.docs);
        }
      });
      // tokens.forEach(function(item) {
      //   // let stem = item.stem();
      //   // Should conditionally classify the incoming words
      //   // classIt(stem, )
      // });
      // twiml.message("Try rephrasing that for me..");
    }
  },
  classifyMessage: function (msg) {
    let said = msg,
        natural = require('natural'),
        classifier = new natural.BayesClassifier(),
        // classifier = new natural.LogisticRegressionClassifier(),
        tokenizer = new natural.WordTokenizer(),
        tokens = tokenizer.tokenize(said),
        msgClass;

    natural.PorterStemmer.attach();

    natural.BayesClassifier.load('classifier.json', null, function(err, classifier) {
      // console.log(classifier.classify(said));
      if (err) {
        console.log("classification lookup failed")
      } else {
        console.log(classifier.classify(said));
        // resultClass = res.classify(said);
        msgClass = classifier.classify(said);
      }
    });

    return msgClass;

    // Watch events? not working...
    // classifier.events.on('trainedWithDocument', function (obj) {
    //   // console.log(obj);
    //   // {
    //   //   total: 23 // There are 23 total documents being trained against
    //   //   index: 12 // The index/number of the document that's just been trained against
    //   //   doc: {...} // The document that has just been indexed
    //   // }
      
    // });
  },

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
    uniquePhoneBook.forEach(function (number, options) {
      try {
        var result = twilio.sendMessage({
          to: number,
          from: TWILIO_NUMBER,
          body: outgoingMessage
        });
        result.type = "outgoing";
        var smsId = Messages.insert(result);
        result._id = smsId;
        console.log("New message sent:", result);
        return result;
      } catch (err) {
        throw new Meteor.error(err);
      }
    });
  }
});

// let everyHour = new Cron(function() {
//   Meteor.call("checkMessages");
// }, {
//   minute: 5
// });

Meteor.startup(() => {
  var getTwilioMessages = Meteor.wrapAsync(twilio.messages.list, twilio.messages);

  function updateMessages () {
    getTwilioMessages(function (err, data) {
      if (err) {
        console.warn("There was an error getting data from twilio", err);
        return
      }
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
    });
  }

  updateMessages();
  Meteor.setInterval(updateMessages, 10000);
});
