import * as storiesService from './stories.service.js';
import { successResponse } from '../../utils/response.js';

export async function createStory(req, res, next) {
  try {
    const story = await storiesService.createStory(req.body, req.file, req.user.id);
    return successResponse(res, story, null, 201);
  } catch (error) {
    next(error);
  }
}

export async function listStories(req, res, next) {
  try {
    const { stories, meta } = await storiesService.listStories(req.query);
    return successResponse(res, stories, meta, 200);
  } catch (error) {
    next(error);
  }
}

export async function getStory(req, res, next) {
  try {
    const story = await storiesService.getStoryById(req.params.id);
    return successResponse(res, story, null, 200);
  } catch (error) {
    next(error);
  }
}

export async function updateStory(req, res, next) {
  try {
    const story = await storiesService.updateStory(req.params.id, req.body, req.file, req.user.id);
    return successResponse(res, story, null, 200);
  } catch (error) {
    next(error);
  }
}

export async function replacePdf(req, res, next) {
  try {
    const result = await storiesService.replaceStoryPdf(req.params.id, req.file, req.user.id);
    return successResponse(res, result, null, 200);
  } catch (error) {
    next(error);
  }
}

export async function deleteStory(req, res, next) {
  try {
    await storiesService.deleteStory(req.params.id, req.user.id);
    return successResponse(res, { message: 'Story deleted successfully' }, null, 200);
  } catch (error) {
    next(error);
  }
}
