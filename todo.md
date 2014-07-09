## TODO High priority
All of this should be done **FIRST**.
* Sync with wallet (triggers etc)
* Verify existence of username.
* Add credit checks
* Check for session cookie! Otherwise NO socket connection. Really. Seriously. The server will explode.
* @todo Make a policy add "where: to = authenticated user". Now both parties will have their messages marked as "read".



## To keep in mind

### Throttle requests
Perhaps to 10 requests a second? We can't be flooded by people with ill intentions.

### Security
Try implementing some sort of validation. As it stands, I see a way of doing this but it's inefficient:

#### Request token
Have the backend in Tier 3 request access for the client using an API token.
This is potentially still a security risk as anyone could use your backend to create their own access token.
This might still work when combined with a CSRF token, filtering out the script kiddies, but not the pros.

### Blueprints
Blueprints are currently enabled, should be disabled (or at least looked at) before deployment.


### Inbox
* Verify existence of username. Make mandatory for new message. Implement check and return appropriate error.

## remainder ideas:
* Create new message through action. Get ID based on username.
* Get inbox subscribes user to updates for inbox. Contemplate using inbox model.
* If using Inbox model, perhaps make it "virtual" and send new data as a new model, even if it doesn't exist (?) Also make sure this gets sent to specific client.
* Set `afterCreate` in Message model and Thread model, to emit events to connected clients.
* Move import and sync to own application.
* Find a way to set if a thread has unread messages for user (in stead of checking only the last message)
