const Augur = require("augurbot");
const colors = require('colors');
const u = require('../utils/utils');
const Module = new Augur.Module();
const { ItemUtils, Item } = require("../utils/ItemUtils"),
    inventory = require("../utils/roleColors");

async function arraysEqual(a, b) {
    if (!Array.isArray(a) && !Array.isArray(b)) return (a == b);
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

Module
    .addCommand({
        name: "testitemutils", // required, must be one word, all lower case
        description: "tests ItemUtils.js", // recommended
        permissions: (msg) => true, // optional, command will onnly run if this evaluate to true
        process: async (msg, suffix) => {
            u.preCommand(msg)
            let testVariables = {
                colorRoles: await [].concat(...(inventory.filter((v, k) => msg.member.roles.cache.has(k)).array())),
                items: await ItemUtils.registeredItems,
                //members: await msg.guild.members.fetch(),
                memberWithItemsNotAdmin: await msg.guild.members.fetch("548618555676033039"), //meekaping
                memberWithInfiniteItems: await msg.guild.members.fetch("487085787326840843"), //behold
                memberWithNoItems: await msg.guild.members.fetch("327906338338242573"), //Aero
                //messages: await msg.channel.messages.fetch()

            }
            let stats = {
                incomplete: 0,
                incompletedTests: [],
                completed: 0,
                failed: 0,
                failedTests: [],
                unexpectedResults: 0,
                unexpectedResultTests: [],
                succeeded: 0,
                succeededTests: [],
            }
            async function testMethod(functionToTest, expectedResult, notes, arg1, arg2, arg3, arg4) {
                let result;
                let err = false;
                stats.incomplete++;
                stats.incompletedTests.push(functionToTest.name + `: ${notes}`);
                try {
                    result = await functionToTest(arg1, arg2, arg3, arg4);
                } catch (error) {
                    err = true;
                    //determine if the error was expected
                    if (typeof expectedResult === "string"
                        && (error.toString().trim().toLowerCase().indexOf(expectedResult.trim().toLowerCase()) > -1)) {
                        error = null;
                        //result = "bad input test success"
                    }
                    else u.log((functionToTest.name + `: ${notes}:` + error.toString()).red);
                } finally {
                    stats.incomplete--;
                    stats.incompletedTests.splice(stats.incompletedTests.indexOf(functionToTest.name + `: ${notes}`),1);
                    let arrayCompare = await arraysEqual(result, expectedResult);
                    if(expectedResult == null || expectedResult == undefined) {
                        stats.failed++
                        stats.failedTests.push(functionToTest.name + `: ${notes}` + `Expected result has not been calculated`);
                    }
                    else if (err) {  
                        stats.failed++
                        stats.failedTests.push(functionToTest.name + `: ${notes}`);
                    } else if ((arrayCompare) || (result == "bad input test success")) {
                        stats.succeeded++;
                        stats.succeededTests.push(functionToTest.name + `: ${notes}`)
                    } else {
                        stats.unexpectedResults++;
                        stats.unexpectedResultTests.push(functionToTest.name + `: ${notes}`);
                        await u.log(functionToTest.name + `: ${notes} succeeded, but had unexpected results:`.yellow + "\n\n" + functionToTest.name.yellow + `: ${notes} Expected ${JSON.stringify(expectedResult, undefined, 2)}` + "\n\n" + functionToTest.name.yellow + `: ${notes} Recieved ${JSON.stringify(result, undefined, 2)}`);
                    }
                    stats.completed++;
                    return result;
                }
            }
            let Tests = {
                getMemberItems: async (msg) => {
                    //getMemberItems should take either a member or a message. 
                    //If it takes a message, then it should select the first mentioned member, or the author member
                    //it should return an array of items the member has

                    //depends on hasInfiniteItems
                    let infiniteItemMemberTest = await testMethod(ItemUtils.getMemberItems, ItemUtils.registeredItems, "Testing member with infinite items", testVariables.memberWithInfiniteItems);
                    let finiteItemMemberTest = await testMethod(
                        ItemUtils.getMemberItems,
                        ItemUtils.registeredItems.filter(item => { return (item.name.toLowerCase().indexOf("ban") > -1 || item.name.toLowerCase().indexOf("shatter") > -1 || item.name.toLowerCase().indexOf("paint") > -1) }),
                        "Testing member without infinite items",
                        testVariables.memberWithItemsNotAdmin);
                    let noItemMemberTest = await testMethod(ItemUtils.getMemberItems, [], "Testing member with no items", testVariables.memberWithNoItems);
                    let messageTest = await testMethod(ItemUtils.getMemberItems, infiniteItemMemberTest, "Testing message", msg);
                    //let badinputtest = await testMethod(ItemUtils.getMemberItems, "No member provided, cannot get items", "bad input : channel", msg.channel);
                    //let badinputtest1 = await testMethod(ItemUtils.getMemberItems, "No member provided, cannot get items", "bad input : user", msg.author);


                },
                /*give: async (msg) => {
                    //give should take an itemResolveable and a target member. 
                    //The item from the resolveable should be given to the target.
                    //The item should be taken from the giver if the giver doesn't have infinite items
                    //should not return anything.
                    //depends on resolveItem
                    await testMethod(ItemUtils.give,)

                },*/
                hasInfiniteItems: async (msg) => {
                    //should take in either member or message
                    //If it takes a message, then it should select the first mentioned member, or the author member
                    //should return a boolean
                    let infiniteItemMemberTest = await testMethod(ItemUtils.hasInfiniteItems, true, "Testing member with infinite items", testVariables.memberWithInfiniteItems);
                    let finiteItemMemberTest = await testMethod(ItemUtils.hasInfiniteItems, false, "Testing member with finite items", testVariables.memberWithItemsNotAdmin);
                    let messageTest = await testMethod(ItemUtils.hasInfiniteItems, true, "Testing message author with infinite items", msg);
                    //let badinputtest = await testMethod(ItemUtils.hasInfiniteItems, "cannot determine item limit", "bad input", msg.channel);


                },
                /*hasItem: async (msg) => {
                    //depends on resolveItem
                 },
                take: async (msg) => { },
                registeredItems: async (msg) => { }, */
                resolveItem: async (msg) => {
                    /** 
                    * Takes a string corresponding to the emoji, item name, or role id, or a discord.role or an item object, and returns the item object for the resolveable
                    * 
                    **/
                     let emojiTest = await testMethod(ItemUtils.resolveItem,  await ItemUtils.registeredItems.find(item => { return (item.name.toLowerCase().indexOf("paint") > -1) }),
                     "Testing emoji 🖌", "🖌");
                     let nameTest = await testMethod(ItemUtils.resolveItem, await  ItemUtils.registeredItems.find(item => { return (item.name.toLowerCase().indexOf("paint") > -1) }),
                     "Testing name paintball", "paintball");
                     let roleTest = await testMethod(ItemUtils.resolveItem, await ItemUtils.registeredItems.find(item => { return (item.name.toLowerCase().indexOf("paint") > -1) }),
                     "Testing role for paintball", await msg.guild.roles.fetch("857767406121910292"));
                     let roleIDTest = await testMethod(ItemUtils.resolveItem, await ItemUtils.registeredItems.find(item => { return (item.name.toLowerCase().indexOf("paint") > -1) }),
                     "Testing roleID for paintball", "857767406121910292");
                     let itemObjectTest = await testMethod(ItemUtils.resolveItem, await ItemUtils.registeredItems.find(item => { return (item.name.toLowerCase().indexOf("paint") > -1) }),
                     "Testing roleID for paintball", ItemUtils.registeredItems.find(item => { return (item.name.toLowerCase().indexOf("paint") > -1)}));  
                   
                },
                /* use: async (msg) => { },
                //item method tests
                ItemConstructor: async (msg) => { },
                ItemPrototypeGive: async (msg) => { },
                ItemPrototypeTake: async (msg) => { },
                ItemPrototypeSetFreeForAll: async (msg) => { },*/
            }
            await Tests.hasInfiniteItems(msg);
            await Tests.getMemberItems(msg);
            await Tests.resolveItem(msg);
            const embed = u.embed().setTitle("Test Results")
                .setColor(msg.guild ? msg.guild.members.cache.get(msg.client.user.id).displayHexColor : "000000")
                .addField("Succeeded:", `\`${stats.succeeded}/${stats.completed + stats.incomplete}\` tests \n\`\`\`${stats.succeededTests.join(",\n") || "No tests Succeeded"}\`\`\``)
                .addField("Unexpected Results:", `\`${stats.unexpectedResults}/${stats.completed + stats.incomplete}\` tests \n\`\`\`${stats.unexpectedResultTests.join(",\n") || "No tests Failed"}\`\`\``)
                .addField("Failed:", `\`${stats.failed}/${stats.completed + stats.incomplete}\` tests \n\`\`\`${stats.failedTests.join(",\n") || "No tests Failed"}\`\`\``)
                .addField("Could not complete:", `\`${stats.incomplete}/${stats.completed + stats.incomplete}\` tests \n\`\`\`${stats.incompletedTests.join(",\n") || "All tests completed"}\`\`\``);
            msg.channel.send({ embed });
            //end your code
            u.postCommand(msg);
        }, // required
    });
module.exports = Module;