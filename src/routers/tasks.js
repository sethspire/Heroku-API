const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')

const router = new express.Router()

router.post('/tasks', auth, async(req, res) => {
    const user = req.user

    const task = new Task({
        ...req.body,
        owner: user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', auth, async(req, res) => {
    const match = {}
    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = (parts[1] == 'asc') ? 1 : -1
    }

    if (req.query.completed) {
        match.completed = (req.query.completed === 'true')
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        })

        res.send(req.user.tasks)
    } catch (e) {
        console.log(e)
        res.status(500).send()
    }
})

router.patch('/tasks', auth, async(req, res) => {
    const mods = req.body
    if (!mods['_id']) {
        return res.status(400).send({ error: 'Requires task ID' })
    }
    const task_id = mods['_id']
    delete mods['_id']
    const props = Object.keys(mods)
    const modifiable = ['title', 'description', 'completed']
    const isValid = props.every((prop) => modifiable.includes(prop))
    if (!isValid) {
        return res.status(400).send({ error: 'Invalid updates.' })
    }
  
    try {
        const task = await Task.findById(task_id)
        if (!task) {
            throw new Error()
        }
        if (!task.owner.equals(req.user._id)) {
            console.log(task.owner)
            console.log(req.user._id)
            throw new Error()
        }
        props.forEach((prop) => task[prop] = mods[prop])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send()
    }
})

router.delete('/tasks', auth, async (req, res) => {
    try {
      let delResult = await Task.deleteOne({_id: req.body._id, owner: req.user._id})
      if (!delResult.deletedCount) {
        throw new Error()
      }
      res.send(req.body)
    } 
    catch (e) {
      res.status(500).send()
    }
})

module.exports = router