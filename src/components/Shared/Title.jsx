import React from 'react'
import {Helmet} from "react-helmet-async"
function Title({title="Chat",description = "Sandesh is a Chat APP"}) {

  return (
    <Helmet>
        <title>{title}</title>
        <meta description="A Chat App" content={description}/>
    </Helmet>
  )
}

export default Title