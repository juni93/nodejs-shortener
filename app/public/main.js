window.onload = function(){
    const form = document.getElementById('url-form')

    form.addEventListener('submit', event => {
        event.preventDefault();
        grecaptcha.ready(function() {
            grecaptcha.execute('6Lc2QNMZAAAAAGiQMBHrjMB11Ru3XJW0LZJ_uvY-', {action: 'validate_captcha'})
            .then(function(token) {
                let recaptcha = document.getElementById('g-recaptcha-response').value = token;
                let msg = document.getElementById('response-message')
                let value = document.getElementById('userUrl').value;
                const data = {
                    value: value,
                    recaptcha: token
                }
                postUrl('/', data)
                    .then(data => {
                        msg.innerHTML = data.message
                        msg.classList.forEach(className => {
                            if (className.startsWith('alert-')) {
                                msg.classList.remove(className);
                            }
                          });
                        msg.classList.toggle(addMsgAlert(data.status))
                    })
            });
        });
        
        
        
    });

    async function postUrl(route, data){
        const response = await fetch(route, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({data: data})
        });
        const json = await response.json();
        json.status = response.status
        return json
    }

    function clearBox(elementID, classToRemove=null)
    {
        document.getElementById(elementID).innerHTML = "";
        if(classToRemove){
            document.getElementById(elementID).classList.remove(classToRemove)
        }
    }

    function addMsgAlert(status){
        switch(status){
            case 404:
                alertClass = 'alert-danger'
                break;
            case 422:
                alertClass = 'alert-warning'
                break;
            case 409:
                alertClass = 'alert-info'
                break;
            case 201:
                alertClass = 'alert-success'
                break;
        }
        return alertClass
    }
}


  
