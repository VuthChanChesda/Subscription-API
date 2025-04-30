import {createRequire} from 'module' // do this to use require in ES module
import Subscription from '../models/subscription.model.js';
const require = createRequire(import.meta.url);
const {serve} = require('@upstash/workflow/express');
import dayjs from 'dayjs';

const REMINDER = [7,5,3,2,1];


export const sendReminder = serve(async (context) => {



   const {subscriptionId} = context.requestPayload;
   const subscription = await fetchSubscription(context, subscriptionId);

    if (!subscription || subscription.status !== 'active') return;

    const renewalDate = dayjs(subscription.renewalDate); //get the renewal date from the subscription 
    if(renewalDate.isBefore(dayjs())) { //check if the renewal date is before today
        console.log('Subscription is already expired');
        return;
    }

    for(let daybefore of REMINDER) {


        //check like this renewalDate - daybefore like 7 days before, 5 days before, etc
        //like is the renewal date is day 20 then the reminder date will be day 13, day 15, day 17, day 18, day 19
        //20 - 7 , 20 -5 and so on
        const reminderDate = renewalDate.subtract(daybefore, 'day');

        //check if the reminder date is after the day to remind user 
        //like the reminder date is 13 , 15  and today is 12 so don't send reminder yet 
        if(reminderDate.isAfter(dayjs())) { 
            console.log(`Sleeping until ${reminderDate}`);

            await sleepUntilReminder(context, `Send reminder for ${daybefore} day before` , reminderDate);
        }
        await tiggerReminder(context, `Send reminder for ${daybefore} day before`);

    }
     
});

const fetchSubscription = async (context, subscriptionId) => {

    return await context.run('get subscription',  async () => {
        const subscription = await Subscription.findById(subscriptionId).populate('user', 'name email');
        return subscription;
    })
}

const sleepUntilReminder = async (context, label ,date) => {
    console.log(`Sleeping until ${label} reminder date ${date}`);
    await context.sleepUntil(label ,date.toDate());
}

const tiggerReminder = async (context, label) => {
    return await context.run(label, () => {
        console.log(`Triggering reminder for ${label}`);
        //send email or notification to user
    });
}