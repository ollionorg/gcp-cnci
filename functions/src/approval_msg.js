const block_id = 'TY-approval-4YT';

const approval_msg = (message, yes_value, no_value) => {
    return [
        {
            'type': 'section',
            'text': {
                'type': 'mrkdwn',
                'text': message
            }
        },
        {
            'type': 'actions',
            'block_id': block_id,
            'elements': [
                {
                    'type': 'button',
                    'text': {
                        'type': 'plain_text',
                        'text': 'Yes',
                        'emoji': true
                    },
                    'value': JSON.stringify(yes_value),
                    'style': 'primary'
                },
                {
                    'type': 'button',
                    'text': {
                        'type': 'plain_text',
                        'text': 'No',
                        'emoji': true
                    },
                    'value': JSON.stringify(no_value),
                    'style': 'danger'
                }
            ]
        }
    ]
}

module.exports = {
    msg: approval_msg,
    block_id: block_id
}