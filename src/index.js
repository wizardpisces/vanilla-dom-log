import VanillaDomLog from './VanillaDomLog'

function getInstance() {
    let instance = null
    return (options) => {

        if (!instance) {
            instance = new VanillaDomLog(options);
        }
        return instance;
    }
}

export default getInstance();