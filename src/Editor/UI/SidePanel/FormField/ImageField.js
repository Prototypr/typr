import React from "react";
import ImageUploader from "../../ImageUploader/ImageUploader";

const ImageField = ({ postObject, coverImage, user, refetchPost }) => {
  return (
    <div className="border border-gray-100 p-4 rounded-md my-3">
      <h2 className="font-medium text-md mb-4 font-secondary">
        Featured Image
      </h2>
      {postObject?.slug ? (
        <ImageUploader
          key={coverImage}
          borderRadius={6}
          disallowScale={true}
          uploadOnInsert={true}
          placeholderImg={
            postObject?.featuredImage
              ? postObject?.featuredImage
              : coverImage
              ? coverImage
              : "https://s3-us-west-1.amazonaws.com/tinify-bucket/%2Fprototypr%2Ftemp%2F1580577924294-Group+74.png"
          }
          height={400}
          width={400}
          adaptable={true}
          postObject={postObject}
          imageUrl={
            postObject?.featuredImage
              ? postObject?.featuredImage
              : coverImage
              ? coverImage
              : null
          }
          setLogoUploadLink={() => {
            return true;
          }}
          center={false}
          uploadImageAPI={"/api/aws/uploadPublicationLogo"}
          uploadAPI={`/api/publication/updatePublication`}
          fieldName="logo"
          uploadButtonText={"Browse"}
          filename={`ftImage_${postObject?.id}`}
          user={user}
          refetchPost={refetchPost}
        />
      ) : (
        <div className="text-sm text-gray-700">
          <p className="mb-3">
            Dear admin, you can only upload a featured image to a post that has
            already been saved as a draft.
          </p>
          <p className="mb-3">
            Press 'Save Draft', and then come back here to attach a featured
            image.
          </p>
          <p className="mb-3 text-xs text-purple-500">
            (Todo: make this work for non drafts where the post has not been
            created yet.)
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageField;
