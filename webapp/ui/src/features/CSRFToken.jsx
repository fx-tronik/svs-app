import React from 'react'
import Cookies from 'js-cookie'

const CSRFToken = () => {

    const csrftoken = Cookies.get('csrftoken');

    return (
        <input type="hidden" name="csrfmiddlewaretoken" value={csrftoken} />
    );
}

export default CSRFToken;
