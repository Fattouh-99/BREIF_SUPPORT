import { prisma } from '@/lib/prisma'
import { slugify } from '@/lib/utils'

export async function onGetBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        published: true
      },
      include: {
        author: {
          select: {
            fullname: true,
            email: true
          }
        },
        category: true,
        tags: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return posts
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return []
  }
}

export async function onGetBlogPost(id: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: {
        id,
        published: true
      },
      include: {
        author: {
          select: {
            fullname: true,
            email: true
          }
        },
        category: true,
        tags: true,
        comments: {
          where: {
            approved: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
    return post
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return null
  }
}

export async function onGetCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function onGetTags() {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: {
        name: 'asc'
      }
    })
    return tags
  } catch (error) {
    console.error('Error fetching tags:', error)
    return []
  }
}

export async function onGetPostsByCategory(categoryId: string) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        categoryId,
        published: true
      },
      include: {
        author: {
          select: {
            fullname: true,
            email: true
          }
        },
        category: true,
        tags: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return posts
  } catch (error) {
    console.error('Error fetching posts by category:', error)
    return []
  }
}

export async function onGetPostsByTag(tagId: string) {
  try {
    const posts = await prisma.blogPost.findMany({
      where: {
        tags: {
          some: {
            id: tagId
          }
        },
        published: true
      },
      include: {
        author: {
          select: {
            fullname: true,
            email: true
          }
        },
        category: true,
        tags: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return posts
  } catch (error) {
    console.error('Error fetching posts by tag:', error)
    return []
  }
}

export async function onAddComment(postId: string, data: { author: string; email: string; content: string }) {
  try {
    const comment = await prisma.comment.create({
      data: {
        ...data,
        postId
      }
    })
    return comment
  } catch (error) {
    console.error('Error adding comment:', error)
    return null
  }
}

export async function onIncrementViews(postId: string) {
  try {
    const post = await prisma.blogPost.update({
      where: {
        id: postId
      },
      data: {
        views: {
          increment: 1
        }
      }
    })
    return post
  } catch (error) {
    console.error('Error incrementing views:', error)
    return null
  }
}

export async function onIncrementLikes(postId: string) {
  try {
    const post = await prisma.blogPost.update({
      where: {
        id: postId
      },
      data: {
        likes: {
          increment: 1
        }
      }
    })
    return post
  } catch (error) {
    console.error('Error incrementing likes:', error)
    return null
  }
} 