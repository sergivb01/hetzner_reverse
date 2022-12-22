# Disclaimer ⚠️
This repository does not intend to harm or disfigure Hetzner Online GmbH or any other organisation using a similar protection method nor do I endorse the use of this PoC in malicious purposes as is merely for educational purposes to show the short comings of such a protection method.

# Hetzner Ray Protection Bypass

Hetzner recently introduced a protection system similar to Cloudflare's Integrity Check, that checks that
the HTTP Client is a legitimate user.

Hetzner's implementation lacks security and is really easy to bypass.

<p align="center">
  <img width="460" height="300" src="https://i.imgur.com/7VHh23b.png" alt="Hetzner's protection">
</p>

## How to

**Note**: hetzner has changed the prefix `0020` to `200`. 

We'll use `curl` to get the source code for the challenge page. We must provide a file to store cookies otherwise
we will get in a redirection loop.

`$ curl -vsL https://hetzner.com --cookie-jar test2.cookie`
> An example output of this command can be found in [output.log](./output.log)

A quick code style reformat to the HTML Source code can help us better understand what's happening.
We can see that each request has a unique _secret_ and that challenge-site
spawns [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers). The source
code of this workers
is loaded from a blob stored in a `script` tag with the type `javascript/worker`.

```javascript
<script id="worker1" type="javascript/worker">
    var _0xb9e4= /* long obfuscated source code*/
</script>
window.addEventListener("load", (event) => {
    var blob = new Blob([document.querySelector("#worker1").textContent], {
        type: "text/javascript",
    });

    // ...
});
```

A callback that will submit a hidden form is set. The application sends each worker a message of secret and the index of
the worker in
hexadecimal format.

```javascript
for (let index = 0; index < concurrency; index++) {
    var worker = new Worker(window.URL.createObjectURL(blob)); // load the source code of the worker from the blob
    worker.onmessage = function (e) {
        once(e, index); // set the callback
        once = () => {
        };
    };
    worker.postMessage("secret_here" + btoa(index));
}
```

### Let's analyze the source code of the workers!

First of all, we'll clean up and unpack & deobfuscate the source code
using [one of the first search results on Google](https://beautifier.io/)

> Pretty-code sample in [worker_script.js](./worker_script.js)

Taking a quick glance over this code, we can see a bunch of function declarations... But remember! We're looking for the
code
of a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) and we sent the
initial data
with a `sendMessage(...)`, so let's look for a `onmessage` callback:

```javascript
self['onmessage'] = function (a) {
    const b = a['data'];
    for (var c = 0; ;) {
        var d = p(b + '' + c.toString());
        if (d['startsWith']('0020')) break;
        c++
    }
    self['postMessage'](c)
}
```

We can easily translate this code as:

```javascript
// lots of function including d(...)
// ..
self.onmessage = function (message) {
    const secret = message['data'];
    for (var i = 0; ;) {
        var result = doSomething(secret + i.toString());
        if (result.startsWith('0020')) break;
        i++
    }
    self.postMessage(i)
}
```

Which makes it easier to understand that it will run `doSomething(secret + i)` until the result of the
function call starts with `0020`. When a match is found, it sends the number back to the main execution.

So, how do we know what `doSomething()` (function `p()`) does? Let's load the rest of the functions in Chrome Dev Tools
and see the output of a sample call.

![Sample empty execution](https://i.imgur.com/7DzyiMf.png)

Huh? Looks like a hash. Let's test it with something _dumb_ that we can look up on Google, such as `admin`...

![Admin hash](https://i.imgur.com/r82CW4z.png)

Let's Google-it up!

![Google results](https://i.imgur.com/gGuIT5q.png)

That was easy... So we can now replace all that code with the following (just google "sha256 javascript" for the source
of `generateSHA256Hex`):

```javascript
self.onmessage = function (message) {
    const secret = message['data'];
    for (var i = 0; ;) {
        var result = generateSHA256Hex(secret + i.toString());
        if (result.startsWith('0020')) break;
        i++
    }
    self.postMessage(i)
}
```

Ok, so we now know that all the worker does is calculate sha256 sums of `secret + i.toString()` until it finds one that
starts with `0020`. Let's go back to the main script now!

## What do we do with the number?

We previously found that once a message from the worker is received it calls `once(e, index)`, so let's look for the
function:

```javascript
let once = function (e, index) {
    console.timeEnd("Solve");
    console.log("Challenge Solved");
    hideVerificationContainer();
    window.setTimeout(function () {
        document.getElementById("challenge").value =
            btoa(index) + e.data.toString();
        document.getElementById("form").submit();
    }, 200);
};
```

So it basically sets the value of the hidden input to `btoa(index + solution)`. If the worker `index = 6` found that on
the `i = 17022`, it would send `btoa(6) + 17022`, which would end up being `Ng==17022`!

A simple POC replicating 1:1 the Javascript is available in this repo. Is not optimized but it can bypass the
protection in a few milliseconds.

Sample POC output:
```
$ go run main.go
2022/12/16 01:03:54 secret is JYfcK3AhngHau2R3qCTSUckvb7xtzfJXTkgyfqes9zAs5DOoqVKGE0OAM5g2qKvsRr6LDSFEe0vQ4oQvchoLniZQbfdhDEaNU33xqoMnw9RYSbt76uH8sHeUslvPdiRg
2022/12/16 01:03:54 found solution NA==1206 in 2.6332ms
2022/12/16 01:03:54 main page code:
<!DOCTYPE html>
<!--                                 HETZNER ONLINE GMBH                                            -->
<!--            Glad to see you are interested in our Source Code. We are always looking for                    -->
<!--            Talents to work with us. Why don't you visit our Career Center at career.hetzner.com.   -->

<!--[if !IE]><!-->
<html lang="en-US">
<!--<![endif]-->
<!--[if IE 6 ]><html lang="en-US" class="ie ie6"><![endif]-->
<!--[if IE 7 ]><html lang="en-US" class="ie ie7"><![endif]-->
<!--[if IE 8 ]><html lang="en-US" class="ie ie8"><![endif]-->
<head>
    <base href="https://www.hetzner.com/"><!--[if lte IE 6]></base><![endif]-->
    <title>Dedicated Server, Cloud, Storage &amp; Hosting</title>
```
