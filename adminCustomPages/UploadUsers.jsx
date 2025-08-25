import React, { useState } from 'react'
import { Box, Button, Label, DropZone, DropZoneItem, DropZoneProps, BasePropertyProps } from '@admin-bro/design-system'



const API_URL = process.env.REACT_APP_API_URL

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
    formData.append('AUTHKEY', "hkhasd")

    try {
      const response = await fetch('https://swif.ttlawcourts.org/api/ttps/admin/bulk/upload-csv', {
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
    <Box className="form-container" style={{padding:"40px", width:"100%", maxWidth:"600px", margin:"20px auto"}}>
      <form onSubmit={handleSubmit}>
        <Label htmlFor="file" style={{ width:"100%", maxWidth:"600px", fontSize:"20px", padding:"10px 0"}}>Upload CSV File</Label>
        <DropZone onChange={handleDrop}>
          <DropZoneItem src={file && URL.createObjectURL(file)} />
        </DropZone>
        <Button variant="primary" type="submit" style={{cursor:"pointer"}}>
          Upload
        </Button>
      </form>
    </Box>
  )
}

export default UploadUsers
