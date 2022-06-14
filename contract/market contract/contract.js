//market contract

async function handle(state, action) {


    switch (action.input.function){

        case "name": {return {result : state.name}}

        case "addListing": {}
        
        case "removeListing": {}

        case "editListing" : {}

        case "transferOwnership" : {
            if (action.caller !== state.owner){
                throw new ContractError(`You cannot transfer that which you do not own`)
            }else {
                state.owner = action.input.data.newOwner;

            }
            return { state }
          }



        default: {
            throw new ContractError(`Unsupported contract function: ${functionName}`);
          }
    }
}