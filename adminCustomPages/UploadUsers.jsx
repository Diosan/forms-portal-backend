import React, { useState } from 'react'
import { Box, Button, Label, DropZone, DropZoneItem, DropZoneProps, BasePropertyProps } from '@admin-bro/design-system'

const UploadUsers = () => {
  const [file, setFile] = useState(null)

  const handleDrop = (files) => {
    setFile(files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      alert('Please select a file to upload')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/your-upload-endpoint', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        alert('File uploaded successfully')
      } else {
        alert('Error uploading file')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error uploading file')
    }
  }

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Label htmlFor="file">Upload CSV File</Label>
        <DropZone onChange={handleDrop}>
          <DropZoneItem src={file && URL.createObjectURL(file)} />
        </DropZone>
        <Button variant="primary" type="submit">
          Upload
        </Button>
      </form>
    </Box>
  )
}

export default UploadUsers
