import { Accounts } from 'meteor/accounts-base';

// Configure Accounts to require username instead of email
Accounts.ui.config({
  // requestPermissions: {
  //   facebook: ['user_likes'],
  //   github: ['user', 'repo']
  // },
  // requestOfflineToken: {
  //   google: true
  // },
  passwordSignupFields: 'USERNAME_ONLY'
});
