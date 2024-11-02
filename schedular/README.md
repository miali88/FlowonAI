# quickstart-scheduler-html

This sample repo will show you how to easily create a custom Scheduler with Nylas. To follow along, consider taking a look at the [Nylas doc's Scheduler Quickstart guide](https://developer.nylas.com/docs/v3/quickstart/scheduler/).

You can create a Scheduler in any frontend framework even just using HTML. This code sample will focus on adding the Scheduler to HTML.

# How to run

1. Install the required packages

```bash
npm install
```

2. In the Nylas dashboard, create a new application and set the Google connector redirect URL to `http://localhost:3000/scheduler-editor`. 

Consider using a `sandbox` application to take advantage of our testing environment where you can connect limited accounts for free!

3. env variables

Update the value `NYLAS_CLIENT_ID` to `client_id` value from the Nylas Dashboard in the file `scheduler-editor.html`.

4. Run the project

```bash
npm run dev -- --port 3000  
```

5. Goto http://localhost:3000/scheduler-editor to authenticate a user and create a scheduler.
