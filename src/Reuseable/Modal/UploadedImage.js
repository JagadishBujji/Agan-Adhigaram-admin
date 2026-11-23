import React, { useState } from 'react';
import './UploadedImage.css';
import { errorNotification } from '../../utils/notification';
import { addImagesWithinLimit, MAX_BOOK_IMAGES } from '../../utils/upload';

const UploadedImage = ({ selectedfile, SetSelectedFile, setDeletedImages }) => {
  const [Files, SetFiles] = useState([]);

  const filesizes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const readFile = (file, index) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve({
          id: new Date().getTime() + index,
          filename: file.name,
          filetype: file.type,
          fileimage: reader.result,
          file,
          datetime: new Date(file.lastModified).toLocaleString('en-IN'),
          filesize: filesizes(file.size),
        });
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const InputChange = async (e) => {
    const files = Array.from(e.target.files || []);
    // lets the same file be picked again after it is removed
    e.target.value = '';
    if (files.length === 0) return;
    try {
      // all files are read first and added in one update, so the 6 image limit cannot be skipped
      const added = await Promise.all(files.map(readFile));
      const { images, dropped } = addImagesWithinLimit(selectedfile, added);
      SetSelectedFile(images);
      if (dropped) errorNotification(`Only ${MAX_BOOK_IMAGES} images should be uploaded`);
    } catch (err) {
      errorNotification('Could not read the image. Please try another file.');
    }
  };

  const DeleteSelectFile = (id) => {
    if (window.confirm('Are you sure you want to delete this Image?')) {
      const result = selectedfile.filter((data) => {
        if (data.id !== id) {
          return true;
        } else {
          setDeletedImages((prevState) => [...prevState, data]);
          return false;
        }
      });
      SetSelectedFile(result);
    } else {
      // alert('No');
    }
  };

  const FileUploadSubmit = async (e) => {
    e.preventDefault();

    // form reset on submit
    e.target.reset();
    if (selectedfile.length > 0) {
      for (let index = 0; index < selectedfile.length; index++) {
        SetFiles((preValue) => [...preValue, selectedfile[index]]);
      }
      SetSelectedFile([]);
    } else {
      alert('Please select file');
    }
  };

  const DeleteFile = async (id) => {
    if (window.confirm('Are you sure you want to delete this Image?')) {
      const result = Files.filter((data) => data.id !== id);
      SetFiles(result);
    } else {
      // alert('No');
    }
  };

  return (
    <div className="fileupload-view">
      <div className="row justify-content-center m-0">
        <div className="col-md-6">
          <div className="card mt-5">
            <div className="card-body">
              <div className="kb-data-box">
                <div className="kb-modal-data-title">
                  <div className="kb-data-title">
                    <h6>Upload Book Images (1st image is thumbnail)</h6>
                  </div>
                </div>
                <form>
                  {/* <form onSubmit={FileUploadSubmit}> */}
                  <div className="kb-file-upload">
                    <div className="file-upload-box">
                      <input
                        type="file"
                        id="fileupload"
                        className="file-upload-input"
                        onChange={InputChange}
                        accept="image/*"
                        multiple
                      />
                      <span>
                        Drag and drop or <span className="file-link">Choose your files</span>
                      </span>
                    </div>
                  </div>
                  <div className="kb-attach-box mb-3">
                    {selectedfile.map((data, index) => {
                      const { id, filename, filetype, fileimage, datetime, filesize } = data;
                      return (
                        <div className="file-atc-box" key={id}>
                          {filename.match(/.(jpg|jpeg|png|gif|svg)$/i) ? (
                            <div className="file-image">
                              {' '}
                              <img src={fileimage} alt="" />
                            </div>
                          ) : (
                            <div className="file-image">
                              <i className="far fa-file-alt"></i>
                            </div>
                          )}
                          <div className="file-detail">
                            <h6>{filename}</h6>
                            <p></p>
                            {filesize && (
                              <p>
                                <span>Size : {filesize}</span>
                                <span className="ml-2">Modified Time : {datetime}</span>
                              </p>
                            )}

                            <div className="file-actions">
                              <button type="button" className="file-action-btn" onClick={() => DeleteSelectFile(id)}>
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* <div className="kb-buttons-box">
                    <button
                      type="button"
                      className="btn btn-primary form-submit"
                      // disabled={!(selectedfile.length === 6)}
                      onClick={() => {
                        if (selectedfile.length < 6) {
                          errorNotification('6 images should be uploaded');
                        } else {
                          handleStoreImages(selectedfile);
                        }
                      }}
                    >
                      Upload Images
                    </button>
                  </div> */}
                </form>
                {Files.length > 0 ? (
                  <div className="kb-attach-box">
                    <hr />
                    {Files.map((data, index) => {
                      const { id, filename, filetype, fileimage, datetime, filesize } = data;
                      return (
                        <div className="file-atc-box" key={index}>
                          {filename.match(/.(jpg|jpeg|png|gif|svg)$/i) ? (
                            <div className="file-image">
                              {' '}
                              <img src={fileimage} alt="" />
                            </div>
                          ) : (
                            <div className="file-image">
                              <i className="far fa-file-alt"></i>
                            </div>
                          )}
                          <div className="file-detail">
                            <h6>{filename}</h6>
                            <p>
                              <span>Size : {filesize}</span>
                              <span className="ml-3">Modified Time : {datetime}</span>
                            </p>
                            <div className="file-actions">
                              <button type="button" className="file-action-btn" onClick={() => DeleteFile(id)}>
                                Delete
                              </button>
                              <a href={fileimage} className="file-action-btn" download={filename}>
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadedImage;
