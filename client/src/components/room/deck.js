import React, { Component } from 'react'
import { Card, HandStyles, CardStyles, Hand } from 'react-casino'
var shufflr = require('shufflr')

const Decker = shufflr.shuffle([
    <Card suit="S" face="A" />,
    <Card suit="S" face="2" />,
    <Card suit="S" face="3" />,
    <Card suit="S" face="4" />,
    <Card suit="S" face="5" />,
    <Card suit="S" face="6" />,
    <Card suit="S" face="7" />,
    <Card suit="S" face="8" />,
    <Card suit="S" face="9" />,
    <Card suit="S" face="T" />,
    <Card suit="S" face="J" />,
    <Card suit="S" face="Q" />,
    <Card suit="S" face="K" />,

    <Card suit="H" face="A" />,
    <Card suit="H" face="2" />,
    <Card suit="H" face="3" />,
    <Card suit="H" face="4" />,
    <Card suit="H" face="5" />,
    <Card suit="H" face="6" />,
    <Card suit="H" face="7" />,
    <Card suit="H" face="8" />,
    <Card suit="H" face="9" />,
    <Card suit="H" face="T" />,
    <Card suit="H" face="J" />,
    <Card suit="H" face="Q" />,
    <Card suit="H" face="K" />,

    <Card suit="C" face="A" />,
    <Card suit="C" face="2" />,
    <Card suit="C" face="3" />,
    <Card suit="C" face="4" />,
    <Card suit="C" face="5" />,
    <Card suit="C" face="6" />,
    <Card suit="C" face="7" />,
    <Card suit="C" face="8" />,
    <Card suit="C" face="9" />,
    <Card suit="C" face="T" />,
    <Card suit="C" face="J" />,
    <Card suit="C" face="Q" />,
    <Card suit="C" face="K" />,

    <Card suit="D" face="A" />,
    <Card suit="D" face="2" />,
    <Card suit="D" face="3" />,
    <Card suit="D" face="4" />,
    <Card suit="D" face="5" />,
    <Card suit="D" face="6" />,
    <Card suit="D" face="7" />,
    <Card suit="D" face="8" />,
    <Card suit="D" face="9" />,
    <Card suit="D" face="T" />,
    <Card suit="D" face="J" />,
    <Card suit="D" face="Q" />,
    <Card suit="D" face="K" />,
])

const Hand1 = () => Decker.slice(0, 13)
const Hand2 = () => Decker.slice(13, 26)
const Hand3 = () => Decker.slice(26, 39)
const Hand4 = () => Decker.slice(39, 52)


export { Hand1, Hand2, Hand3, Hand4 }
