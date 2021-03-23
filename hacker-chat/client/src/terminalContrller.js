import ComponentsBuilder from "./components.js";
import { constants } from "./constants.js";


export default class TerminalController {
    #userColors = new Map()

    constructor() {}

    #pickCollor() {
        return `#` + ((1<< 24) * Math.random() | 0).toString(16) + '-fg'
    }

    #getUserCollor(userName) {
        if(this.#userColors.has(userName))
            return this.#userColors.get(userName)
        
        const collor = this.#pickCollor()
        this.#userColors.set(userName, collor)
        
        return collor
    }

    #onInputReceived(eventEmiter) {
        return function() {
            const message = this.getValue()
            console.log(message)
            this.clearValue()
        }
    }

    #onMessageReceived({screen, chat}) {
        return msg => {
            const { userName, message} = msg
            const collor = this.#getUserCollor(userName)

            chat.addItem(`{${collor}}{bold}${userName}{/}: ${message}`)
            screen.render()
        }
    }

    #onLogChanged({screen, activityLog}) {
        return msg => {
            //userName join
            //username left

            const [userName] = msg.split(/\s/)
            const collor = this.#getUserCollor(userName)

            activityLog.addItem(`{${collor}}{bold}${msg.toString()}{/}`)
            screen.render()

        }
    }

    #onStatusChanger({screen, status}) {

        // Lista todos os usuarios
        return users =>{

            //pegar o primeiro elemento da lista
            const { content } = status.items.shift()
            status.clearItems()
            status.addItem(content)

            users.forEach(userName => {
                const collor = this.#getUserCollor(userName)
                status.addItem(`{${collor}}{bold}${userName}{/}`)
            })

            screen.render()
        }
    }

    #registerEvents(eventEmiter, components) {
        eventEmiter.on(constants.events.app.MESSAGE_RECEIVED, this.#onMessageReceived(components))
        eventEmiter.on(constants.events.app.ACTIVITYLOG_UPDATE, this.#onLogChanged(components))
        eventEmiter.on(constants.events.app.STATUS_UPDATE, this.#onStatusChanger(components))
    }

    async initializeTable(eventEmiter) {
        console.log("Inicializado...")
        const components = new ComponentsBuilder()
                .setScreen({ title: 'HackerChat - CREEDgg'})
                .setLayoutComponent()
                .setInputComponent(this.#onInputReceived(eventEmiter))
                .setChatComponent()
                .setActivityLogComponent()
                .setStatusComponent()
                .build()

        this.#registerEvents(eventEmiter, components)

        components.input.focus()
        components.screen.render()

    }
}