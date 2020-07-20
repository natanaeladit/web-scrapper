// const readline = require("readline");
// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// function printName(name) {
//     console.log(`${name}`);
// }

// rl.question("What is your name ? ", function (name) {
//     printName(name);
//     rl.close();
// });

// rl.on("close", function () {
//     console.log("\nBYE BYE !!!");
//     process.exit(0);
// });

class Node {
    constructor(element, next = null) {
        this.element = element;
        this.next = next;
    }
}

class LinkedList {
    constructor() {
        this.head = null;
    }

    push(element) {
        var node = new Node(element);
        if (!this.head) {
            this.head = node;
        }
        else {
            var current = this.head;
            while (current.next) {
                current = current.next;
            }
            current.next = node;
        }
    }

    reverseNode(node, prev) {
        var newNode = new Node(node.element, prev);
        if (node.next) {
            return this.reverseNode(node.next, newNode);
        }
        else {
            return newNode;
        }
    }

    reverseList() {
        return this.reverseNode(this.head, null);
    }
}

var list = new LinkedList();
list.push('a');
list.push('b');
list.push('c');
list.push('d');
list.push('e');
console.log(JSON.stringify(list.reverseList()));
