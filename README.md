# WebBSD

This library brings bottom sheet dialogs which are found in Android to the Web.
It is built based on https://codepen.io/pixelasticity/pen/ZQGyYP

## Installation
You have to include the following files in your HTML
- webbsd.js
- webbsd.css

They can be found inside "dist" directory.

## Usage
Create an element to contain the BSD
> `<div id="bsd"></div>`

Then instantiate instance of BSD object using `createInstance` method and pass element ID of the container. Note that there must be only one instance of the BSD object in the entire application so it is wise to store in in a global variable.
>`const options = { height: "200px", isModeless: false }`
> `let bsd = webbsd.BottomSheetDialog.createInstance("bsd", options)`;

Show the dialog with a content.
> `const html='<h3>Hello</h3>'`
> `bsd.showContent(html)`
  
To hide the dialog use `hide` method
>` bsd.hide()`

## Options
You can set BSD options while creating the BSD instance. These options are considered as initial (or global) options and are used whenever the dialog needs to be shown. You can override them for a specific show action. `showContent` accepts an instance of options object as its second parameter. This options are temporary and used for that show action only.
Show options instances are of type `BsdOptions` which can be found inside `webbst.ts` file.

All your files and folders are presented as a tree in the file explorer. You can switch from one to another by clicking a file in the tree.

## Modal vs Modeless
Dialogs can be modal. They cover the entire page and close when there is click outside them.
Modeless dialogs do not cover the entire page and act as a normal element inside the page. They can be closed only from code.
By default dialogs are modal. To to a modeless dialog set `isModeless` field in options object.