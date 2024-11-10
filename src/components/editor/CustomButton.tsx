import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { EditorState, Modifier } from 'draft-js'
import { FormControl, MenuItem, Select } from '@mui/material'

export class CustomButton extends Component {
  static propTypes = {
    onChange: PropTypes.func,
    editorState: PropTypes.object
  }

  addStar = (v: string) => {
    //ts-ignore
    const { editorState, onChange } = this.props as any
    const contentState = Modifier.replaceText(
      editorState.getCurrentContent(),
      editorState.getSelection(),
      v,
      editorState.getCurrentInlineStyle()
    )
    onChange(EditorState.push(editorState, contentState, 'insert-characters'))
  }

  render() {
    return (
      <FormControl>
        <Select displayEmpty placeholder='Insert variable' sx={{ height: 30 }}>
          <MenuItem disabled>
            <em>Insert variable</em>
          </MenuItem>
          <MenuItem
            value={'{{name}}'}
            onClick={() => {
              this.addStar('{{name}}')
            }}
          >
            Name
          </MenuItem>
        </Select>
      </FormControl>
    )
  }
}
