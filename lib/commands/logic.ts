import Discord from 'discord.js';
import { 
    ICommand,
    IExecuteText, 
    IExecuteCustom, 
    IExecuteEmbed, 
    IEmbedField
} from '../types/command';
import { botRefuses } from '../rng';
import { isUserAdmin } from '../message';

class Command {
    public channel: Discord.TextChannel | Discord.DMChannel | Discord.GroupDMChannel;
    public canBeExecuted: boolean;
    private isDisabled: boolean;
    private isModOnly: boolean;
    private isProtected: boolean;
    private refusal: string;

    constructor(command:ICommand, msg:Discord.Message) {
        this.channel = msg.channel;
        this.isDisabled = command.isDisabled || false;
        this.isModOnly = command.isModOnly || false;
        this.isProtected = command.isProtected || true;
        this.refusal = command.refusal || 'I won\'t execute your petty command.';
        this.canBeExecuted = this._canBeExecuted(msg);
    }

    private _canBeExecuted(msg:Discord.Message) {
        if (this.isDisabled) {
            msg.react('🚧');
            return false;
        }
        if (this.isModOnly && !isUserAdmin(msg)) {
            msg.react('🚫');
            return false;
        }
        if (botRefuses()) {
            this.channel.send(this.refusal);
            return false;
        }
        return true;
    }
}

export class TextCommand extends Command implements IExecuteText {
    public execute(content:string) {
        this.canBeExecuted && this.channel.send(content);
    }
}
export class EmbedCommand extends Command implements IExecuteEmbed {
    public execute(fields:[ IEmbedField ]) {
        this.canBeExecuted && this.channel.send('Embeds aren\'t supported yet.');
    }
}
export class CustomCommand extends Command implements IExecuteCustom {
    public execute(fn:Function, ...args:Array<any>) { 
        this.canBeExecuted && fn(...args);
    }
}
