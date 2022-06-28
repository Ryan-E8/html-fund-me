import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

console.log(ethers)

async function connect() {
    // if metamask extension is installed
    if (typeof window.ethereum !== "undefined") {
        // Triggers the connect pop-up for metamask
        await window.ethereum.request({ method: "eth_requestAccounts" })
        // Update the text of our button when we connect
        connectButton.innerHTML = "Connected!"
    } else {
        connectButton.innerHTML = "Please install metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        // Web3Provider takes the http endpoint from our metamask (window.ethereum)
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        // This will return whatever wallet is connected to our provider - our provider is metamask
        const signer = provider.getSigner()
        // Address and abi coming from our constants folder
        const contract = new ethers.Contract(contractAddress, abi, signer)
        // try catch is for if you reject the transaction
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            // Wait for this tx to finish
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Miing ${transactionResponse.hash}...`)
    // Resolve = If this promise works correctly call this resolve function. For us the promise will be done when the listener finishes listening
    // Reject if there is some kind of timeout
    return new Promise((resolve, reject) => {
        // listen for this transaction to finish
        // Once the transactionResponse.hash is found, we are going to call our anonymous function and then resolve, Promise will only return when resolve or reject is called and we are telling it to only resolve once transactionResponse.hash is found
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}
