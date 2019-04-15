import DomLog from './DomLog'

function getInstance() {
    let instance = null
    return (options) => {

        if (!instance) {
            instance = new DomLog(options);
        }
        return instance;
    }
}

export default getInstance();