
/***
 * contract created by Atticus
 */
export async function handle(state, action){

    switch (action.input.function) {
        case 'name': { // returns contract name
          return { result: state.name };
        }
        case 'methods': { // returns all methods available in this contract
            return { result: [
                {name: "returns the name of the contract"}, 
                {methods: "returns a list of all the contract methods and descriptions"}, 
                {createAsset: "creates a new asset in the contract"}, 
                {createCollection: "Creates a collection to hold a range of assets."},
                {mintFromCollection: "mints a token for the caller"}, 
                {mintMembership: "mints a new membership token for caller"},
                {transfer: "transfers asset from caller to another address"}, 
                {transferMembership: "transfers the callers membership token"},
                {updateMemberSettings: "Updates the settings key in the members token"},
                {updateMemberAvatar: "updates the url location of the members avatar picture"},
                {updateMemberScore: "updates the members score (wins,losses,stalemates,total games) in the members token"},
                {updateMemberLevel: "updates the members level in the members token"},
                {burnAsset: "burns a created asset - only available on non-original assets and membership tokens"}, 
                {burnCollection: "Burns a collection and all the assets in it, if the collection is burnable"}, 
                {burnMembership: "Burns the callers membership token"},
                {transferOwnership: "transfers ownership of this contract to another address"}, 
            ] }
        }
        
        case "transfer": { // transfers asset from one person to another
            const toAddress = action.input.data.to;
            const category = action.input.data.category
            const asset = action.input.data.asset;
            const collection = action.input.data.collection
            if (!state.assets[category][collection].assets[asset].owners.includes(action.caller)) { // check if user owns that token
            throw new ContractError("Sender does not own that token, cannot transfer");
            }
            state.assets[category][collection].assets[asset].owners = delete action.caller;
            state.assets[category][collection].assets[asset].owners.push(toAddress);
            return { state };
        }
      
        case "createAsset" : { // creates a new asset/token in the contract
            const category = action.input.data.category
            const collection = action.input.data.collection
            const asset = action.input.data.asset;
            if(state.assets[category][collection]){
                if(state.assets[category][collection].assets[asset]){
                throw new ContractError(
                    'that asset already exists'
                )
            }else {
                state.assets[category][collection].assets[asset.name] = asset
            }}else {
                throw new ContractError(`Collection does not exist, create collection before creating an asset`)
            }
            return { state } 
            
        }
        case "createCollection" : { // create collection in the contract
            const collection = action.input.data.collection
            const category = action.input.data.category
            if(state.assets[category][collection]){
            throw new ContractError(`collection already exists`)} else {
                state.assets[category][collection] = collection
            }
            return { state }
        }
        case "burnCollection" : { //burns entire collection
            const collection = action.input.data.collection
            const category = action.input.data.category
            if(state.assets[category][collection]){
                if(state.assets[category][collection].owners === action.caller){
                    if (state.assets[category][collection].burnable === true){
                          delete state.assets[category][collection]
            } else {
                throw new ContractError(`Collection is not burnable`)
            }}else {
                throw new ContractError(`Only the owner of a collection can burn that collection`)
            }} else {
                throw new ContractError(`Collection does not exist`)
            }
            return { state }
        }
        case "mintFromCollection": { //add user to owners list for asset (mints a token for that user)
            const collection = action.input.data.collection
            const asset = action.input.data.asset;
            const category = action.input.data.asset
            if (state.assets[category][collection].assets[asset]){//checks if asset exists, if it doesnt it throws an error

            if (!state.assets[category][collection].assets[asset].owners.includes(action.caller)) { //check if user already owns that asset, if they do throws an error 
             state.assets[category][collection].assets[asset].owners.push(action.caller);
            } else {
                throw new ContractError(`Can only own one of that nft, sorry!`)
            }
        
        } else{
                throw new ContractError(`That asset does not exist`);
            }
            return { state };
          }
          case "mintMembership" : { // mints a new membership token for the caller
            const asset = action.input.data.asset;
            const member = action.caller
            if (!state.assets.membershipToken.assets[member]){//checks if asset exists, if it does it throws an error
                state.assets.membershipToken.assets[member] = asset
        
        } else {
                throw new ContractError(`You already own a membership token, you can only own one.`);
            }
            return { state };
          
          }
          case "updateMemberSettings" : { // changes the members settings
              const member = action.caller
              const newSettings = action.input.data.newSettings
              if(state.assets.membershipToken.assets[member]){
                state.assets.membershipToken.assets[member].settings = newSettings
              } else {
                  throw new ContractError(`You need to mint a membership before changing your settings`)
              }
              return { state }

          }
          case "updateMemberAvatar" : { // changes members avatar
            const member = action.caller
              const newAvatar = action.input.data.newAvatar
              if(state.assets.membershipToken.assets[member]){
                state.assets.membershipToken.assets[member].avatar = newAvatar
              } else {
                  throw new ContractError(`You need to mint a membership before changing your Avatar`)
              } 
              return { state }
            
        }
        case "updateMemberScore" : { // changes members score
              const member = action.caller
              const newScore = action.input.data.newScore
                if(state.assets.membershipToken.assets[member]){
                    state.assets.membershipToken.assets[member].score = newScore
                } else {
                    throw new ContractError(`You need to mint a membership before changing your score`)
                } 
              return { state }
            
        }
        case "updateMemberLevel" : { // changes members Level
            const member = action.caller
              const newLevel = action.input.data.newLevel
              if(state.assets.membershipToken.assets[member]){
                state.assets.membershipToken.assets[member].level = newLevel
              } else {
                  throw new ContractError(`You need to mint a membership before changing your level`)
              } 
              return { state }
            
        }
        case "transferMembership" : { //transfers membership to another account
            const fromAddress = action.caller
            const toAddress = action.input.data.to
            const tokenDetails = state.assets.membershipToken.assets[fromAddress]

            if (state.assets.membershipToken.assets[fromAddress]){ // checks if that token exists
                {if (!state.assets.membershipToken.assets[toAddress]){ // checks if token can be transfered to the toAddress
               delete state.assets.membershipToken.assets[fromAddress]
               state.assets.membershipToken.assets[toAddress] = tokenDetails
               state.assets.membershipToken.assets[toAddress].owners = toAddress

            }else {
                throw new ContractError(`You cant transfer that token to ${toAddress} because they already own a membershipToken `)
            }
        }}else {
                throw new ContractError(`You dont own a membershipToken to transfer.`)
            }
            return { state }
        }
        case "burnMembership" : { // burns membership token
            const member = action.caller
            if (state.asset.membershipToken.assets[member]){
                delete state.asset.membershipToken.assets[member]
            }else {
                throw new ContractError(`Cannot burn that token, it does not exist`)
            }
            return { state } 
        }
          case 'burnAsset' : { //deletes asset from contract, only available for non-preset assets
            const collection = action.input.data.collection
            const asset = action.input.data.asset;
            const category = action.input.data.category
            if (action.caller === state.assets[category][collection].owners){
                if(state.assets[category][collection].assets[asset].burnable === false){
                throw new ContractError(
                    `asset is not burnable`
                )
            }else {
                delete state.assets[category][collection].assets[asset]
            }}else {
                throw new ContractError(`You must be the owner of the collection to burn an asset`)
            }
            return { state }

          }
          case 'contractOwner' : { //returns who owns the contract
              return { result : state.owner}
          }

          case "transferOwnership" : { // transfers ownership of the contract
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

