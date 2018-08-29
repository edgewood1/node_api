// var stdin = process.openStdin();

// stdin.addListener("data", function(d) {
//     // note:  d is an object, and when converted to a string it will
//     // end with a linefeed.  so we (rather crudely) account for that  
//     // with toString() and then trim() 
//     console.log("you entered: [" + 
//         d.toString().trim() + "]");
//   });


// console.log(process.argv)

// shows bin holding node itself
// the script we're running
// --param? 
// any parameters including along

// console.log(process.stdout)

// run and prints out an object starting with WriteStream

// var msg = "hello"
// process.stdout.write(msg+'/n')

// does console log... 

// console.log(process.env)

if (typeof(process.env.x) !== undefined) {
    console.log("string!")
} else {
    console.log("nope")
}
