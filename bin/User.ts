export class User{
    public id: String;
    public cameIn: Number;
    constructor(
        public nick: String,
        public gender: String
    ){
        this.cameIn = (new Date()).getTime();
    }
    setID(id: String){
            this.id = id
    }
}